import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as events from 'aws-cdk-lib/aws-events';
import { EndpointsCollection } from './endpoints-collection.construct';

export interface ApiPermissionsProps {
  readonly endpoints: EndpointsCollection;
  readonly websitesTable: dynamodb.ITable;
  readonly websiteStatusTable: dynamodb.ITable;
  readonly intervalParameter: ssm.IStringParameter;
  readonly checkerRule: events.IRule;
}

export class ApiPermissions extends Construct {
  constructor(scope: Construct, id: string, props: ApiPermissionsProps) {
    super(scope, id);

    const {
      endpoints,
      websitesTable,
      websiteStatusTable,
      intervalParameter,
      checkerRule,
    } = props;

    this.grantStatusEndpointPermissions(
      endpoints,
      websiteStatusTable
    );

    this.grantIntervalEndpointPermissions(
      endpoints,
      intervalParameter,
      checkerRule
    );

    this.grantWebsiteEndpointPermissions(
      endpoints,
      websitesTable
    );
  }

  private grantStatusEndpointPermissions(
    endpoints: EndpointsCollection,
    websiteStatusTable: dynamodb.ITable
  ): void {
    const statusEndpoint = endpoints.getEndpoint('StatusEndpoint');
    
    // Grant read access to website status table
    websiteStatusTable.grantReadData(statusEndpoint.lambda.function);
  }

  private grantIntervalEndpointPermissions(
    endpoints: EndpointsCollection,
    parameter: ssm.IStringParameter,
    rule: events.IRule
  ): void {
    const getIntervalEndpoint = endpoints.getEndpoint('GetIntervalEndpoint');
    parameter.grantRead(getIntervalEndpoint.lambda.function);

    const updateIntervalEndpoint = endpoints.getEndpoint('UpdateIntervalEndpoint');
    parameter.grantWrite(updateIntervalEndpoint.lambda.function);
    
    updateIntervalEndpoint.lambda.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['events:PutRule'],
        resources: [rule.ruleArn],
      })
    );
  }

  private grantWebsiteEndpointPermissions(
    endpoints: EndpointsCollection,
    table: dynamodb.ITable
  ): void {
    const listWebsitesEndpoint = endpoints.getEndpoint('ListWebsitesEndpoint');
    table.grantReadData(listWebsitesEndpoint.lambda.function);

    const addWebsiteEndpoint = endpoints.getEndpoint('AddWebsiteEndpoint');
    table.grantWriteData(addWebsiteEndpoint.lambda.function);

    const deleteWebsiteEndpoint = endpoints.getEndpoint('DeleteWebsiteEndpoint');
    table.grantWriteData(deleteWebsiteEndpoint.lambda.function);
  }
}
