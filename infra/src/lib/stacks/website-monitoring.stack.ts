import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from '../constructs/api/api-gateway.construct';
import { EndpointsCollection } from '../constructs/api/endpoints-collection.construct';
import { ApiPermissions } from '../constructs/api/api-permissions.construct';
import { config } from '../../config/infrastructure.config';
import { WebsiteCheckerLambda } from '../constructs/health-checker/website-checker-lambda.construct';
import { S3WebsiteConstruct } from '../constructs/webapp/s3-website.construct';
import { WebsitesTable } from '../constructs/data/websites-table.construct';
import { WebsiteStatusTable } from '../constructs/data/website-status-table.construct';
import { EventBridgeSchedule } from '../constructs/health-checker/eventbridge-schedule.construct';
import { Duration } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class WebsiteMonitoringStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websitesTable = new WebsitesTable(this, 'WebsitesTable', {
      tableName: config.resources.websitesTableName,
    });

    const websiteStatusTable = new WebsiteStatusTable(this, 'WebsiteStatusTable', {
      tableName: config.resources.websiteStatusTableName,
    });

    // Import existing SSM parameter (managed by initialize.yml workflow)
    const intervalParameter = ssm.StringParameter.fromStringParameterName(
      this,
      'CheckIntervalParameter',
      config.resources.intervalParameterName,
    );

    // Read the current interval from SSM parameter to preserve user settings on redeploy
    const currentInterval = ssm.StringParameter.valueFromLookup(
      this,
      config.resources.intervalParameterName,
    );
    
    // Parse interval, fallback to default if lookup fails or returns non-numeric value
    const parsedInterval = parseInt(currentInterval);
    const intervalMinutes = !isNaN(parsedInterval) 
      ? parsedInterval 
      : config.schedule.defaultIntervalMinutes;

    // Create the website checker lambda
    const websiteChecker = new WebsiteCheckerLambda(this, 'WebsiteChecker', {
      timeout: Duration.seconds(config.healthCheckerLambda.lambdaTimeoutSeconds),
      memorySize: config.healthCheckerLambda?.memorySize,
      environment: {
        POWERTOOLS_SERVICE_NAME: config.app.serviceName,
        WEBSITES_TABLE_NAME: websitesTable.table.tableName,
        WEBSITE_STATUS_TABLE_NAME: websiteStatusTable.table.tableName,
      }
    });

    // Grant DynamoDB read access to checker Lambda
    websitesTable.table.grantReadData(websiteChecker.function);
    // Grant DynamoDB write access to website status table
    websiteStatusTable.table.grantWriteData(websiteChecker.function);

    // Create EventBridge schedule to trigger the checker
    // Uses the current value from SSM to preserve user settings on redeploy
    const checkerSchedule = new EventBridgeSchedule(this, 'WebsiteCheckerSchedule', {
      targetFunction: websiteChecker.function,
      intervalMinutes: intervalMinutes,
      description: 'Triggers website health check periodically',
      ruleName: config.resources.checkerRuleName,
    });

    // Create API Gateway
    const apiGateway = new ApiGatewayConstruct(this, 'WebsiteMonitoringApi', {
      apiName: config.resources.apiName,
      description: 'Website Monitoring REST API',
      stageName: config.app.stage,
      enableCors: true,
    });

    // Create all API endpoints from config
    const endpoints = new EndpointsCollection(this, 'EndpointsCollection', {
      api: apiGateway.restApi,
      environmentVariables: {
        StatusEndpoint: {
          WEBSITE_STATUS_TABLE_NAME: websiteStatusTable.table.tableName,
        },
        GetIntervalEndpoint: {
          INTERVAL_PARAMETER_NAME: intervalParameter.parameterName,
        },
        UpdateIntervalEndpoint: {
          INTERVAL_PARAMETER_NAME: intervalParameter.parameterName,
          EVENTBRIDGE_RULE_NAME: config.resources.checkerRuleName,
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

    // Configure all API endpoint permissions
    new ApiPermissions(this, 'ApiPermissions', {
      endpoints,
      websitesTable: websitesTable.table,
      websiteStatusTable: websiteStatusTable.table,
      intervalParameter,
      checkerRule: checkerSchedule.rule,
    });

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
    const website = new S3WebsiteConstruct(this, 'WebsiteHosting', {
      bucketName: config.resources.websiteBucketName,
    });

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
