import { Config, interpolate } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { NetworkPolicy } from '@pulumi/kubernetes/networking/v1';
import { WebAppResource, RedisResource } from './resources';
// import { DockerRegistrySecret } from "./resources"; // Commented out for now

// Get configuration
const config = new Config();
const appName = 'observation-explorer';
const namespace = 'observation-explorer';

// Get app version from environment variable or use "latest" as fallback
const appVersion = process.env.APP_VERSION || 'latest';
console.log(`Deploying version: ${appVersion}`);

// Get image names from environment variables with lowercase repository owner
const webImage =
  process.env.WEB_IMAGE ||
  `ghcr.io/robbeverhelst/observation-explorer:${appVersion}`;
console.log(`Web image: ${webImage}`);

// Redis configuration - prefer environment variable over Pulumi config
const redisConfig = {
  password:
    process.env.REDIS_PASSWORD ||
    config.get('redisPassword') ||
    'redis_password_change_me',
};

// Create a Kubernetes provider instance that uses kubeconfig from Pulumi configuration
const provider = new Provider('k8s-provider', {
  kubeconfig: config.requireSecret('kubeconfig'),
});

// Create a Kubernetes namespace
const ns = new Namespace(
  namespace,
  {
    metadata: {
      name: namespace,
    },
  },
  { provider }
);

// Get GitHub credentials: Prefer GHA environment variables, fallback to Pulumi config
const githubUsername =
  process.env.GHCR_USERNAME || config.get('githubUsername') || '';
// const githubTokenInput =
//   process.env.GHCR_TOKEN || config.getSecret('githubToken') || '';
// const githubToken = output(githubTokenInput);

// Log GitHub credentials status (optional for local development)
if (githubUsername) {
  console.log(`Using GitHub username for GHCR: ${githubUsername}`);
  if (process.env.GHCR_TOKEN) {
    console.log(
      'Using GHCR_TOKEN from GitHub Actions environment for GHCR authentication.'
    );
  } else {
    console.log(
      "Using 'githubToken' from Pulumi config for GHCR authentication (if set)."
    );
  }
} else {
  console.log(
    'No GitHub credentials configured. Docker registry secret will not be created.'
  );
}

// Create Docker registry secret (commented out for now)
// const dockerRegistry = new DockerRegistrySecret("ghcr", {
//   appName,
//   namespace,
//   provider,
//   username: githubUsername,
//   token: githubToken,
//   registryUrl: "ghcr.io",
//   dependencies: [ns],
// });

// Deploy Redis
const redis = new RedisResource('redis', {
  appName,
  namespace,
  provider,
  password: redisConfig.password,
  persistence: {
    enabled: true,
    size: '10Gi',
    storageClass: 'truenas-hdd-mirror-iscsi',
  },
  dependencies: [ns],
});

// Create web application environment variables
const webEnv = [
  {
    name: 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
    value: process.env.MAPBOX_ACCESS_TOKEN || '',
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    value: process.env.GOOGLE_CLIENT_ID || '',
  },
  {
    name: 'REDIS_URL',
    value: interpolate`redis://:${redisConfig.password}@${redis.serviceName}.${namespace}.svc.cluster.local:6379`,
  },
  {
    name: 'NODE_ENV',
    value: 'production',
  },
  {
    name: 'APP_VERSION',
    value: appVersion,
  },
  // OAuth credentials for Observation API
  {
    name: 'OAUTH_GRANT_TYPE',
    value: process.env.OAUTH_GRANT_TYPE || 'password',
  },
  {
    name: 'OAUTH_CLIENT_ID',
    value: process.env.OAUTH_CLIENT_ID || '',
  },
  {
    name: 'OAUTH_CLIENT_SECRET',
    value: process.env.OAUTH_CLIENT_SECRET || '',
  },
  {
    name: 'OAUTH_USERNAME',
    value: process.env.OAUTH_USERNAME || '',
  },
  {
    name: 'OAUTH_PASSWORD',
    value: process.env.OAUTH_PASSWORD || '',
  },
];

// Deploy web application
const webApp = new WebAppResource('web', {
  appName,
  namespace,
  provider,
  image: webImage,
  port: 3000,
  labels: { app: appName },
  env: webEnv,
  dependencies: [ns, redis.chart],
});

// Network Policies for security
new NetworkPolicy(
  `${appName}-default-deny`,
  {
    metadata: {
      name: `${appName}-default-deny`,
      namespace,
    },
    spec: {
      podSelector: {}, // Apply to all pods in namespace
      policyTypes: ['Ingress', 'Egress'],
      // No ingress/egress rules = deny all
    },
  },
  { provider, dependsOn: [ns] }
);

new NetworkPolicy(
  `${appName}-web-policy`,
  {
    metadata: {
      name: `${appName}-web-policy`,
      namespace,
    },
    spec: {
      podSelector: {
        matchLabels: { app: appName },
      },
      policyTypes: ['Ingress', 'Egress'],
      ingress: [
        {
          // Allow Cloudflare tunnel ingress
          from: [
            {
              namespaceSelector: {
                matchLabels: { name: 'network' },
              },
            },
            {
              // Allow from kube-system for health checks
              namespaceSelector: {
                matchLabels: { name: 'kube-system' },
              },
            },
          ],
          ports: [{ protocol: 'TCP', port: 3000 }],
        },
      ],
      egress: [
        {
          // Allow DNS resolution
          to: [
            {
              namespaceSelector: {},
              podSelector: {
                matchLabels: { 'k8s-app': 'kube-dns' },
              },
            },
          ],
          ports: [
            { protocol: 'UDP', port: 53 },
            { protocol: 'TCP', port: 53 },
          ],
        },
        {
          // Allow communication to Redis
          to: [
            {
              podSelector: {
                matchLabels: { 'app.kubernetes.io/name': 'redis' },
              },
            },
          ],
          ports: [{ protocol: 'TCP', port: 6379 }],
        },
        {
          // Allow HTTPS outbound for external APIs (waarneming.nl, etc.)
          ports: [
            { protocol: 'TCP', port: 443 },
            { protocol: 'TCP', port: 80 },
          ],
        },
      ],
    },
  },
  { provider, dependsOn: [webApp.deployment] }
);

new NetworkPolicy(
  `${appName}-redis-policy`,
  {
    metadata: {
      name: `${appName}-redis-policy`,
      namespace,
    },
    spec: {
      podSelector: {
        matchLabels: { 'app.kubernetes.io/name': 'redis' },
      },
      policyTypes: ['Ingress', 'Egress'],
      ingress: [
        {
          // Only allow web app to connect to Redis
          from: [
            {
              podSelector: {
                matchLabels: { app: appName },
              },
            },
          ],
          ports: [{ protocol: 'TCP', port: 6379 }],
        },
      ],
      egress: [
        {
          // Allow DNS resolution
          to: [
            {
              namespaceSelector: {},
              podSelector: {
                matchLabels: { 'k8s-app': 'kube-dns' },
              },
            },
          ],
          ports: [
            { protocol: 'UDP', port: 53 },
            { protocol: 'TCP', port: 53 },
          ],
        },
      ],
    },
  },
  { provider, dependsOn: [redis.chart] }
);

// Export the service names and namespace
export const webServiceName = webApp.service.metadata.name;
export const serviceNamespace = namespace;
export const kubernetesCluster = config.require('clusterName');
export const webServiceUrl = webApp.serviceUrl;
export const deployedVersion = appVersion;

// Export monitoring details
export const serviceMonitorName = webApp.serviceMonitor.metadata.apply(
  (m) => m.name
);

// Export Redis connection details
export const redisServiceName = redis.serviceName;
export const redisServiceUrl = redis.serviceUrl;
