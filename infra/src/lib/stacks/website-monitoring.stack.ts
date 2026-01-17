import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { ApiGatewayConstruct } from '../constructs/api-gateway.construct';
import { scheduleConfig } from '../../config/schedule.config';
import { WebsiteCheckerLambda } from '../constructs/website-checker-lambda.construct';
import { ApiEndpoint } from '../constructs/api-endpoint.construct';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';

const _handlerBasePath = resolve(__dirname, '../../../service/src');

export class WebsiteMonitoringStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const _region = this.region;
    const _accountId = this.account;
    const stageName = 'prod';

    // Create the website checker lambda
    const websiteChecker = new WebsiteCheckerLambda(this, 'WebsiteChecker', {
      timeout: Duration.seconds(30),
      memorySize: 256,
    });

    // Create EventBridge rule to trigger the checker on schedule
    const checkerRule = new Rule(this, 'WebsiteCheckerSchedule', {
      description: 'Triggers website health check periodically',
      schedule: Schedule.rate(Duration.seconds(scheduleConfig.intervalSeconds)),
    });

    // Add the lambda as a target
    checkerRule.addTarget(new LambdaFunction(websiteChecker.function));

    // Create API Gateway
    const apiGateway = new ApiGatewayConstruct(this, 'WebsiteMonitoringApi', {
      apiName: 'WebsiteMonitoringApi',
      description: 'Website Monitoring REST API',
      stageName,
      enableCors: true,
    });

    // Create GET /api/status endpoint
    const statusEndpoint = new ApiEndpoint(this, 'StatusEndpoint', {
      api: apiGateway.restApi,
      path: '/api/status',
      method: 'GET',
      handlerPath: 'status/status.ts',
      environment: {
        LOG_GROUP_NAME: websiteChecker.function.logGroup.logGroupName,
        MAX_LOOKBACK_MINUTES: '60',
      },
    });

    // Grant permissions
    websiteChecker.function.logGroup.grantRead(statusEndpoint.lambda.function);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: apiGateway.restApi.url,
      description: 'Website Monitoring API URL',
    });

    new cdk.CfnOutput(this, 'StatusEndpoint', {
      value: `${apiGateway.restApi.url}api/status`,
      description: 'Status endpoint URL',
    });
  }
}
