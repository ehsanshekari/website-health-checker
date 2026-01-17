import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const logger = new Logger();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;

interface AddWebsiteRequest {
  url: string;
  contentRequirement: string;
}

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
    const body: AddWebsiteRequest = JSON.parse(event.body || '{}');
    const { url, contentRequirement } = body;

    if (!url || !contentRequirement) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'url and contentRequirement are required' }),
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    const id = randomUUID();
    const website = {
      id,
      url,
      contentRequirement,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: WEBSITES_TABLE_NAME,
        Item: website,
      })
    );

    logger.info('Added website', { id, url });

    return {
      statusCode: 201,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ website }),
    };
  } catch (err) {
    logger.error('Failed to add website', { error: String(err) });
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to add website' }),
    };
  }
}
