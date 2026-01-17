import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const logger = new Logger();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!WEBSITES_TABLE_NAME) {
    logger.error('WEBSITES_TABLE_NAME env var is required');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const response = await docClient.send(
      new ScanCommand({
        TableName: WEBSITES_TABLE_NAME,
      })
    );

    const websites = response.Items || [];

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ websites }),
    };
  } catch (err) {
    logger.error('Failed to list websites', { error: String(err) });
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to retrieve websites' }),
    };
  }
}
