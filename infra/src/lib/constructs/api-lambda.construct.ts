import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export interface ApiLambdaProps {
  /** Relative path to the handler file from service/src/handlers directory */
  readonly handlerPath: string;
  /** Lambda function name for AWS console */
  readonly functionName?: string;
  /** Log group name for AWS console */
  readonly logGroupName?: string;
  /** Handler function name (default: 'handler') */
  readonly handlerName?: string;
  /** Lambda timeout (default: 30 seconds) */
  readonly timeout?: Duration;
  /** Lambda memory size (default: 256 MB) */
  readonly memorySize?: number;
  /** Environment variables */
  readonly environment?: Record<string, string>;
  /** Additional external modules to exclude from bundling */
  readonly additionalExternalModules?: string[];
}

/**
 * Reusable construct for creating API Lambda functions with standard configuration
 */
export class ApiLambda extends Construct {
  public readonly function: NodejsFunction;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    const {
      handlerPath,
      functionName,
      logGroupName,
      handlerName = 'handler',
      timeout = Duration.seconds(30),
      memorySize = 256,
      environment = {},
      additionalExternalModules = [],
    } = props;

    // Standard external modules for AWS SDK v3
    const externalModules = [
      'aws-sdk',
      '@aws-sdk/*',
      ...additionalExternalModules,
    ];

    const logGroup = logGroupName ? new LogGroup(this, 'LogGroup', {
      logGroupName,
      retention: RetentionDays.ONE_WEEK,
    }) : undefined;

    this.function = new NodejsFunction(this, 'Function', {
      functionName,
      entry: path.resolve(process.cwd(), `../service/src/handlers/${handlerPath}`),
      handler: handlerName,
      runtime: Runtime.NODEJS_22_X,
      timeout,
      memorySize,
      logGroup,
      bundling: {
        externalModules,
        forceDockerBundling: false,
      },
      environment,
    });
  }
}
