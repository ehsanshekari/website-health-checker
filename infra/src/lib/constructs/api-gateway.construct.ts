import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApiGatewayConstructProps {
  /** API Gateway name */
  apiName: string;
  /** Description for the API */
  description?: string;
  /** Stage name for deployment */
  stageName?: string;
  /** Enable CORS with default settings */
  enableCors?: boolean;
}

/**
 * Creates a REST API Gateway
 */
export class ApiGatewayConstruct extends Construct {
  public readonly restApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    const {
      apiName,
      description,
      stageName = 'prod',
      enableCors = true,
    } = props;

    this.restApi = new apigateway.RestApi(this, 'RestApi', {
      restApiName: apiName,
      description: description || `${apiName} REST API`,
      deployOptions: {
        stageName,
      },
      ...(enableCors && {
        defaultCorsPreflightOptions: {
          allowOrigins: apigateway.Cors.ALL_ORIGINS,
          allowMethods: apigateway.Cors.ALL_METHODS,
        },
      }),
    });
  }
}
