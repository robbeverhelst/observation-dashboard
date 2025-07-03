import {
  ComponentResource,
  ComponentResourceOptions,
  Output,
  interpolate,
} from '@pulumi/pulumi';
import { Deployment } from '@pulumi/kubernetes/apps/v1';
import { Service, ServiceAccount } from '@pulumi/kubernetes/core/v1';
import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { AppResourceConfig } from './types';

export class WebAppResource extends ComponentResource {
  public readonly deployment: Deployment;
  public readonly service: Service;
  public readonly serviceAccount: ServiceAccount;
  public readonly serviceMonitor: CustomResource;
  public readonly serviceUrl: Output<string>;

  constructor(
    name: string,
    config: AppResourceConfig,
    opts?: ComponentResourceOptions
  ) {
    super('observation-explorer:resources:WebApp', name, {}, opts);

    const deploymentName = `${config.appName}-web`;
    const appVersion = config.image.split(':').pop() || 'latest';

    // Web Service Account with minimal permissions
    this.serviceAccount = new ServiceAccount(
      `${config.appName}-web-sa`,
      {
        metadata: {
          name: `${config.appName}-web-sa`,
          namespace: config.namespace,
          annotations: {
            'kubernetes.io/description':
              'Service account for web frontend with minimal permissions',
          },
        },
        automountServiceAccountToken: false, // Web frontend doesn't need API access
      },
      { parent: this, provider: config.provider }
    );

    this.deployment = new Deployment(
      deploymentName,
      {
        metadata: {
          name: deploymentName,
          namespace: config.namespace,
          labels: config.labels,
          annotations: {
            'app.kubernetes.io/version': appVersion,
            'pulumi.com/patchForce': 'true',
          },
        },
        spec: {
          selector: {
            matchLabels: config.labels,
          },
          replicas: config.replicas || 2,
          strategy: {
            type: 'RollingUpdate',
            rollingUpdate: {
              maxUnavailable: 1,
              maxSurge: 1,
            },
          },
          template: {
            metadata: {
              labels: config.labels,
              annotations: {
                'app.kubernetes.io/version': appVersion,
                'prometheus.io/scrape': 'true',
                'prometheus.io/port': '3000',
                'prometheus.io/path': '/api/metrics',
              },
            },
            spec: {
              serviceAccountName: this.serviceAccount.metadata.name,
              automountServiceAccountToken: false,
              containers: [
                {
                  name: `${config.appName}-web`,
                  image: config.image,
                  ports: [
                    { containerPort: config.port, name: 'http' },
                    { containerPort: 9464, name: 'metrics' },
                  ],
                  env: config.env,
                  resources: config.resources || {
                    limits: {
                      cpu: '200m',
                      memory: '256Mi',
                      'ephemeral-storage': '512Mi',
                    },
                    requests: {
                      cpu: '100m',
                      memory: '128Mi',
                      'ephemeral-storage': '256Mi',
                    },
                  },
                  imagePullPolicy: 'Always',
                  livenessProbe: {
                    httpGet: {
                      path: '/api/health',
                      port: config.port,
                    },
                    initialDelaySeconds: 30,
                    periodSeconds: 10,
                  },
                  readinessProbe: {
                    httpGet: {
                      path: '/api/health',
                      port: config.port,
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 5,
                  },
                  lifecycle: {
                    preStop: {
                      exec: {
                        command: ['/bin/sh', '-c', 'sleep 15'],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        provider: config.provider,
        dependsOn: config.dependencies,
        parent: this,
      }
    );

    this.service = new Service(
      `${config.appName}-web-service`,
      {
        metadata: {
          name: `${config.appName}-web-service`,
          namespace: config.namespace,
          labels: config.labels,
        },
        spec: {
          type: 'ClusterIP',
          ports: [
            {
              name: 'http',
              port: config.port,
              targetPort: config.port,
            },
            {
              name: 'metrics',
              port: 9464,
              targetPort: 9464,
            },
          ],
          selector: config.labels,
        },
      },
      {
        provider: config.provider,
        dependsOn: [this.deployment],
        parent: this,
      }
    );

    // Create ServiceMonitor for Prometheus Operator
    this.serviceMonitor = new CustomResource(
      `${config.appName}-servicemonitor`,
      {
        apiVersion: 'monitoring.coreos.com/v1',
        kind: 'ServiceMonitor',
        metadata: {
          name: `${config.appName}-servicemonitor`,
          namespace: config.namespace,
          labels: {
            ...config.labels,
            app: config.appName,
            release: 'prometheus',
          },
        },
        spec: {
          selector: {
            matchLabels: config.labels,
          },
          endpoints: [
            {
              port: 'http',
              path: '/api/metrics',
              interval: '30s',
              scrapeTimeout: '10s',
              scheme: 'http',
              honorLabels: true,
              metricRelabelings: [
                {
                  sourceLabels: ['__name__'],
                  regex:
                    '^(cache_hits_total|cache_misses_total|external_api_requests_total|observations_displayed_total|user_refresh_actions_total|new_data_detections_total|application_errors_total|request_deduplication_total|prefetch_requests_total|swr_cache_requests_total|swr_revalidations_total|cache_invalidations_total)$',
                  action: 'keep',
                },
              ],
            },
          ],
          namespaceSelector: {
            matchNames: [config.namespace],
          },
        },
      },
      {
        provider: config.provider,
        dependsOn: [this.service],
        parent: this,
      }
    );

    this.serviceUrl = interpolate`${this.service.metadata.name}.${config.namespace}.svc.cluster.local`;

    this.registerOutputs({
      deployment: this.deployment,
      service: this.service,
      serviceAccount: this.serviceAccount,
      serviceMonitor: this.serviceMonitor,
      serviceUrl: this.serviceUrl,
    });
  }
}
