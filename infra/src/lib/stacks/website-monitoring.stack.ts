import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from '../constructs/api-gateway.construct';
import { scheduleConfig } from '../../config/schedule.config';
import { WebsiteCheckerLambda } from '../constructs/website-checker-lambda.construct';
import { ApiEndpoint } from '../constructs/api-endpoint.construct';
import { S3WebsiteConstruct } from '../constructs/s3-website.construct';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';

export class WebsiteMonitoringStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stageName = 'prod';

    // Create the website checker lambda
    const websiteChecker = new WebsiteCheckerLambda(this, 'WebsiteChecker', {
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        POWERTOOLS_SERVICE_NAME: 'WebsiteMonitoring',
      }
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
      functionName: 'getStatus',
      logGroupName: '/aws/lambda/getStatus',
      environment: {
        LOG_GROUP_NAME: websiteChecker.function.logGroup.logGroupName,
        MAX_LOOKBACK_MINUTES: '60',
      },
    });

    // Grant permissions for CloudWatch Logs Insights queries
    websiteChecker.function.logGroup.grantRead(statusEndpoint.lambda.function);
    websiteChecker.function.logGroup.grant(statusEndpoint.lambda.function, 
      'logs:StartQuery',
      'logs:GetQueryResults'
    );

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: apiGateway.restApi.url,
      description: 'Website Monitoring API URL',
      exportName: 'WebsiteMonitoringApiUrl',
    });

    const statusEndpointUrl = `${apiGateway.restApi.url}api/status`;

    new cdk.CfnOutput(this, 'StatusEndpointUrl', {
      value: statusEndpointUrl,
      description: 'Status endpoint URL',
      exportName: 'WebsiteMonitoringStatusEndpointUrl',
    });

    // Create S3 static website hosting for the webapp
    const website = new S3WebsiteConstruct(this, 'WebsiteHosting', {});

    // Output the website URL
    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: website.websiteUrl,
      description: 'S3 static website URL for the monitoring webapp',
    });

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: website.bucket.bucketName,
      description: 'S3 bucket name for webapp',
    });
  }
}
