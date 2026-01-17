import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';

export interface WebsiteCheckerLambdaProps {
  readonly timeout?: Duration;
  readonly memorySize?: number;
  readonly environment?: Record<string, string>;
}

export class WebsiteCheckerLambda extends Construct {
  public readonly function: NodejsFunction;

  constructor(scope: Construct, id: string, props?: WebsiteCheckerLambdaProps) {
    super(scope, id);

    this.function = new NodejsFunction(this, 'Function', {
      entry: path.join(__dirname, '../../../service/src/handlers/website-health-checker.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: props?.timeout ?? Duration.seconds(30),
      memorySize: props?.memorySize ?? 256,
      bundling: {
        externalModules: ['aws-sdk'],
        forceDockerBundling: false,
      },
      environment: props?.environment ?? {},
    });
  }
}
