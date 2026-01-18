import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  ScanCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Website } from '../types/website';

export class WebsitesRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(tableName: string, client?: DynamoDBClient) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = tableName;
  }

  async add(website: Omit<Website, 'createdAt'>): Promise<Website> {
    const newWebsite: Website = {
      ...website,
      createdAt: new Date().toISOString(),
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: newWebsite,
        ConditionExpression: 'attribute_not_exists(#url)',
        ExpressionAttributeNames: {
          '#url': 'url',
        },
      })
    );

    return newWebsite;
  }

  async delete(url: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { url },
      })
    );
  }

  async get(url: string): Promise<Website | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { url },
      })
    );

    return (response.Item as Website) || null;
  }

  async list(): Promise<Website[]> {
    const response = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    return (response.Items as Website[]) || [];
  }
}
