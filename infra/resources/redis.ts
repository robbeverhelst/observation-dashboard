import { Chart } from '@pulumi/kubernetes/helm/v3';
import { Service } from '@pulumi/kubernetes/core/v1';
import { interpolate, Output } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';
import { Resource } from '@pulumi/pulumi';

export interface RedisResourceConfig {
  appName: string;
  namespace: string;
  provider: Provider;
  password?: string;
  persistence?: {
    enabled?: boolean;
    size?: string;
    storageClass?: string;
  };
  resources?: {
    limits?: {
      cpu?: string;
      memory?: string;
    };
    requests?: {
      cpu?: string;
      memory?: string;
    };
  };
  dependencies?: Resource[];
}

export class RedisResource {
  public chart: Chart;
  public service: Service;
  public serviceName: Output<string>;
  public serviceUrl: Output<string>;

  constructor(name: string, config: RedisResourceConfig) {
    const {
      appName,
      namespace,
      provider,
      password,
      persistence = { enabled: true, size: '1Gi' },
      resources = {
        limits: { cpu: '200m', memory: '256Mi' },
        requests: { cpu: '100m', memory: '128Mi' },
      },
      dependencies = [],
    } = config;

    // Deploy Redis using Bitnami Helm chart
    this.chart = new Chart(
      name,
      {
        chart: 'redis',
        version: '18.19.4',
        fetchOpts: {
          repo: 'https://charts.bitnami.com/bitnami',
        },
        namespace,
        values: {
          global: {
            redis: {
              password: password || 'redis_password_change_me',
            },
          },
          architecture: 'standalone',
          auth: {
            enabled: !!password,
            password: password || 'redis_password_change_me',
          },
          master: {
            persistence: {
              enabled: persistence.enabled,
              size: persistence.size || '1Gi',
              storageClass: persistence.storageClass || '',
            },
            resources: {
              limits: resources.limits,
              requests: resources.requests,
            },
          },
          replica: {
            replicaCount: 0, // Single instance
          },
          metrics: {
            enabled: false, // Disable metrics for simplicity
          },
          networkPolicy: {
            enabled: false, // We'll handle network policies separately
          },
          commonLabels: {
            app: `${appName}-redis`,
            component: 'redis',
          },
        },
      },
      {
        provider,
        dependsOn: dependencies,
      }
    );

    // Get the Redis service
    this.service = Service.get(
      `${name}-service`,
      interpolate`${namespace}/${name}-redis-master`,
      { provider }
    );

    this.serviceName = interpolate`${name}-redis-master`;
    this.serviceUrl = interpolate`redis://${this.serviceName}.${namespace}.svc.cluster.local:6379`;
  }
}
