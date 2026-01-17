import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export interface ApiLambdaProps {
  readonly handlerPath: string;
  readonly functionName?: string;
  readonly logGroupName?: string;
  readonly handlerName?: string;
  readonly timeout?: Duration;
  readonly memorySize?: number;
  readonly environment?: Record<string, string>;
  readonly retention?: RetentionDays;
  readonly removalPolicy?: RemovalPolicy;
}

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
      retention = RetentionDays.ONE_WEEK,
      removalPolicy = RemovalPolicy.RETAIN,
    } = props;

    const logGroup = logGroupName ? new LogGroup(this, 'LogGroup', {
      logGroupName,
      retention,
      removalPolicy,
    }) : undefined;

    this.function = new NodejsFunction(this, 'Function', {
      functionName,
      entry: path.resolve(process.cwd(), `../service/src/handlers/${handlerPath}`),
      handler: handlerName,
      runtime: Runtime.NODEJS_22_X,
      timeout,
      memorySize,
      logGroup,
      environment,
    });
  }
}
