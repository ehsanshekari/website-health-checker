import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiLambda, ApiLambdaProps } from './api-lambda.construct';

export interface ApiEndpointProps extends ApiLambdaProps {
  /** The API Gateway REST API to attach to */
  readonly api: apigateway.RestApi;
  /** The resource path (e.g., '/api/status' or 'api/status') */
  readonly path: string;
  /** HTTP method (default: 'GET') */
  readonly method?: string;
}

/**
 * Reusable construct that creates an API Lambda and attaches it to an API Gateway endpoint
 */
export class ApiEndpoint extends Construct {
  public readonly lambda: ApiLambda;

  constructor(scope: Construct, id: string, props: ApiEndpointProps) {
    super(scope, id);

    const {
      api,
      path,
      method = 'GET',
      ...lambdaProps
    } = props;

    // Create the lambda
    this.lambda = new ApiLambda(this, 'Lambda', lambdaProps);

    // Parse the path and create resource structure
    const pathParts = path.replace(/^\//, '').split('/').filter(Boolean);
    let resource: apigateway.IResource = api.root;

    for (const part of pathParts) {
      const existing = resource.getResource(part);
      resource = existing ?? resource.addResource(part);
    }

    // Add the method with lambda integration
    resource.addMethod(method, new apigateway.LambdaIntegration(this.lambda.function));
  }
}
