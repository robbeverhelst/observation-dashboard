import { Input, Output, Resource } from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';

export interface BaseResourceConfig {
  appName: string;
  namespace: string;
  provider: Provider;
  labels: Record<string, string>;
}

export interface AppResourceConfig extends BaseResourceConfig {
  image: string;
  replicas?: number;
  port: number;
  env?: Input<
    Input<{
      name: Input<string>;
      value: Input<string>;
    }>[]
  >;
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
