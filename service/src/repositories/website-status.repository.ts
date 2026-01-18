import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { StatusItem } from '../types/website';

function isStatusItem(item: unknown): item is StatusItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const record = item as Record<string, unknown>;

  return (
    typeof record.url === 'string' &&
    typeof record.status === 'string' &&
    typeof record.lastChecked === 'string' &&
    (record.responseTimeMs === undefined || typeof record.responseTimeMs === 'number') &&
    (record.statusCode === undefined || typeof record.statusCode === 'number')
  );
}

export class WebsiteStatusRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(tableName: string, client?: DynamoDBClient) {
    const dynamoClient = client || new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
    this.tableName = tableName;
  }

  async save(status: StatusItem): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: status,
      })
    );
  }

  async listAll(): Promise<StatusItem[]> {
    const response = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    const items = response.Items || [];

    return items.filter((item) => {
      return isStatusItem(item);
    }) as StatusItem[];
  }
}
