import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteCheckerLambda } from '../constructs/website-checker-lambda.construct';

export class WebsiteMonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the website checker Lambda
    const websiteChecker = new WebsiteCheckerLambda(this, 'WebsiteChecker', {
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        // Add any environment variables here
      },
    });

    // Output the Lambda function name
    new cdk.CfnOutput(this, 'WebsiteCheckerFunctionName', {
      value: websiteChecker.function.functionName,
      description: 'Website Checker Lambda Function Name',
    });

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, 'WebsiteCheckerFunctionArn', {
      value: websiteChecker.function.functionArn,
      description: 'Website Checker Lambda Function ARN',
    });
  }
}
