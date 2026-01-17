import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface ApiGatewayConstructProps {
  apiName: string;
  description?: string;
  stageName?: string;
  enableCors?: boolean;
}

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
