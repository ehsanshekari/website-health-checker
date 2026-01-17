import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const logger = new Logger();

// Initialize DynamoDB client once (reused across Lambda invocations)
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const WEBSITE_STATUS_TABLE_NAME = process.env.WEBSITE_STATUS_TABLE_NAME;

interface StatusItem {
  url: string;
  status: string;
  responseTimeMs?: number;
  statusCode?: number;
  lastChecked: string;
}

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!WEBSITE_STATUS_TABLE_NAME) {
    logger.error('WEBSITE_STATUS_TABLE_NAME env var is required');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    // Scan status table - each URL has exactly one record (latest status)
    const response = await docClient.send(
      new ScanCommand({
        TableName: WEBSITE_STATUS_TABLE_NAME,
      })
    );

    const items = (response.Items || []) as StatusItem[];

    logger.info('Successfully fetched status', { itemCount: items.length });

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        generatedAt: new Date().toISOString(), 
        items 
      }),
    };
  } catch (err) {
    logger.error('Failed to get latest status', { error: String(err) });
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to fetch status' }),
    };
  }
}
