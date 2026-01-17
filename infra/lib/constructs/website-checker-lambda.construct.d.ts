import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration } from 'aws-cdk-lib';
export interface WebsiteCheckerLambdaProps {
    readonly timeout?: Duration;
    readonly memorySize?: number;
    readonly environment?: Record<string, string>;
}
export declare class WebsiteCheckerLambda extends Construct {
    readonly function: NodejsFunction;
    constructor(scope: Construct, id: string, props?: WebsiteCheckerLambdaProps);
}
