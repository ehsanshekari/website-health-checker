import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiEndpoint } from './api-endpoint.construct';
import { apiEndpointsConfig, ApiEndpointConfig } from '../../config/api-endpoints.config';

export interface EndpointsCollectionProps {
  readonly api: apigateway.RestApi;
  readonly environmentVariables?: Record<string, Record<string, string>>;
}

/**
 * Creates multiple API endpoints from configuration
 */
export class EndpointsCollection extends Construct {
  public readonly endpoints: Map<string, ApiEndpoint> = new Map();

  constructor(scope: Construct, id: string, props: EndpointsCollectionProps) {
    super(scope, id);

    const { api, environmentVariables = {} } = props;

    // Create all endpoints from config
    for (const endpointConfig of apiEndpointsConfig) {
      const endpoint = this.createEndpoint(api, endpointConfig, environmentVariables[endpointConfig.id]);
      this.endpoints.set(endpointConfig.id, endpoint);
    }
  }

  private createEndpoint(
    api: apigateway.RestApi,
    config: ApiEndpointConfig,
    customEnv?: Record<string, string>
  ): ApiEndpoint {
    return new ApiEndpoint(this, config.id, {
      api,
      path: config.path,
      method: config.method,
      handlerPath: config.handlerPath,
      functionName: config.functionName,
      logGroupName: config.logGroupName,
      environment: {
        ...config.environment,
        ...customEnv,
      },
    });
  }

  /**
   * Get an endpoint by its ID
   */
  public getEndpoint(id: string): ApiEndpoint {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) {
      throw new Error(`Endpoint with id '${id}' not found`);
    }
    return endpoint;
  }
}
