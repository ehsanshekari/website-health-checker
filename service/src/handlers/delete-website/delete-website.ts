import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const logger = new Logger();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (!WEBSITES_TABLE_NAME) {
    logger.error('WEBSITES_TABLE_NAME env var is required');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const url = event.pathParameters?.id; // Keep 'id' parameter name for API compatibility

    if (!url) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Website URL is required' }),
      };
    }

    // Decode URL from path parameter
    const decodedUrl = decodeURIComponent(url);

    await docClient.send(
      new DeleteCommand({
        TableName: WEBSITES_TABLE_NAME,
        Key: { url: decodedUrl },
      })
    );

    logger.info('Deleted website', { url: decodedUrl });

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    logger.error('Failed to delete website', { error: String(err) });
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to delete website' }),
    };
  }
}
