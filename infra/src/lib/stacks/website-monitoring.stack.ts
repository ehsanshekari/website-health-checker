import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteCheckerLambda } from '../constructs/website-checker-lambda.construct';
import { EventBridgeSchedule } from '../constructs/eventbridge-schedule.construct';
import { scheduleConfig } from '../config/schedule.config';

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

    // Create EventBridge schedule to trigger the Lambda
    const schedule = new EventBridgeSchedule(this, 'WebsiteCheckerSchedule', {
      targetFunction: websiteChecker.function,
      intervalSeconds: scheduleConfig.intervalSeconds,
      description: 'Triggers website health checker Lambda',
      ruleName: 'WebsiteHealthCheckerSchedule',
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

    // Output the EventBridge rule ARN
    new cdk.CfnOutput(this, 'ScheduleRuleArn', {
      value: schedule.rule.ruleArn,
      description: 'EventBridge Schedule Rule ARN',
    });

    // Output the schedule interval
    new cdk.CfnOutput(this, 'ScheduleInterval', {
      value: `${scheduleConfig.intervalSeconds} seconds`,
      description: 'Schedule execution interval',
    });
  }
}
