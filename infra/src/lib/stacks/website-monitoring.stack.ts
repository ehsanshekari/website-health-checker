import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from '../constructs/api-gateway.construct';
import { EndpointsCollection } from '../constructs/endpoints-collection.construct';
import { scheduleConfig } from '../../config/schedule.config';
import { WebsiteCheckerLambda } from '../constructs/website-checker-lambda.construct';
import { S3WebsiteConstruct } from '../constructs/s3-website.construct';
import { WebsitesTable } from '../constructs/websites-table.construct';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

export class WebsiteMonitoringStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stageName = 'prod';

    // Create DynamoDB table for websites
    const websitesTable = new WebsitesTable(this, 'WebsitesTable', {
      tableName: 'website-monitoring-websites',
    });

    // Create SSM parameter for check interval
    const intervalParameter = new ssm.StringParameter(this, 'CheckIntervalParameter', {
      parameterName: '/website-monitoring/check-interval-seconds',
      stringValue: '60',
      description: 'Website check interval in seconds',
      tier: ssm.ParameterTier.STANDARD,
    });

    // Create the website checker lambda
    const websiteChecker = new WebsiteCheckerLambda(this, 'WebsiteChecker', {
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        POWERTOOLS_SERVICE_NAME: 'WebsiteMonitoring',
        WEBSITES_TABLE_NAME: websitesTable.table.tableName,
      }
    });

    // Grant DynamoDB read access to checker Lambda
    websitesTable.table.grantReadData(websiteChecker.function);

    // Create EventBridge rule to trigger the checker on schedule
    const checkerRule = new Rule(this, 'WebsiteCheckerSchedule', {
      ruleName: 'website-monitoring-checker-schedule',
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

    // Create all API endpoints from config
    const endpoints = new EndpointsCollection(this, 'EndpointsCollection', {
      api: apiGateway.restApi,
      environmentVariables: {
        StatusEndpoint: {
          LOG_GROUP_NAME: websiteChecker.function.logGroup.logGroupName,
          MAX_LOOKBACK_MINUTES: '60',
        },
        GetIntervalEndpoint: {
          INTERVAL_PARAMETER_NAME: intervalParameter.parameterName,
        },
        UpdateIntervalEndpoint: {
          INTERVAL_PARAMETER_NAME: intervalParameter.parameterName,
          EVENTBRIDGE_RULE_NAME: 'website-monitoring-checker-schedule',
        },
        ListWebsitesEndpoint: {
          WEBSITES_TABLE_NAME: websitesTable.table.tableName,
        },
        AddWebsiteEndpoint: {
          WEBSITES_TABLE_NAME: websitesTable.table.tableName,
        },
        DeleteWebsiteEndpoint: {
          WEBSITES_TABLE_NAME: websitesTable.table.tableName,
        },
      },
    });

    // Grant permissions for status endpoint (CloudWatch Logs)
    const statusEndpoint = endpoints.getEndpoint('StatusEndpoint');
    websiteChecker.function.logGroup.grantRead(statusEndpoint.lambda.function);
    websiteChecker.function.logGroup.grant(statusEndpoint.lambda.function, 
      'logs:StartQuery',
      'logs:GetQueryResults'
    );

    // Grant SSM permissions for interval endpoints
    const getIntervalEndpoint = endpoints.getEndpoint('GetIntervalEndpoint');
    intervalParameter.grantRead(getIntervalEndpoint.lambda.function);

    const updateIntervalEndpoint = endpoints.getEndpoint('UpdateIntervalEndpoint');
    intervalParameter.grantWrite(updateIntervalEndpoint.lambda.function);
    updateIntervalEndpoint.lambda.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['events:PutRule'],
        resources: [checkerRule.ruleArn],
      })
    );

    // Grant DynamoDB permissions for website endpoints
    const listWebsitesEndpoint = endpoints.getEndpoint('ListWebsitesEndpoint');
    websitesTable.table.grantReadData(listWebsitesEndpoint.lambda.function);

    const addWebsiteEndpoint = endpoints.getEndpoint('AddWebsiteEndpoint');
    websitesTable.table.grantWriteData(addWebsiteEndpoint.lambda.function);

    const deleteWebsiteEndpoint = endpoints.getEndpoint('DeleteWebsiteEndpoint');
    websitesTable.table.grantWriteData(deleteWebsiteEndpoint.lambda.function);

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
