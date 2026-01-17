import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { ApiLambda, ApiLambdaProps } from './api-lambda.construct';

export interface ApiEndpointProps extends ApiLambdaProps {
  readonly api: apigateway.RestApi;
  readonly path: string;
  readonly method: string;
}

export class ApiEndpoint extends Construct {
  public readonly lambda: ApiLambda;

  constructor(scope: Construct, id: string, props: ApiEndpointProps) {
    super(scope, id);

    const {
      api,
      path,
      method,
      ...lambdaProps
    } = props;

    this.lambda = new ApiLambda(this, 'Lambda', lambdaProps);

    const pathParts = path.replace(/^\//, '').split('/').filter(Boolean);
    let resource: apigateway.IResource = api.root;

    for (const part of pathParts) {
      const existing = resource.getResource(part);
      resource = existing ?? resource.addResource(part);
    }

    resource.addMethod(method, new apigateway.LambdaIntegration(this.lambda.function));
  }
}
