import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface WebsiteStatusTableProps {
  readonly tableName: string;
}

export class WebsiteStatusTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: WebsiteStatusTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'url', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName: props.tableName,
    });
  }
}
