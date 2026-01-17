import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const logger = new Logger();
const ssmClient = new SSMClient({});

const INTERVAL_PARAMETER_NAME = process.env.INTERVAL_PARAMETER_NAME;

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!INTERVAL_PARAMETER_NAME) {
    logger.error('INTERVAL_PARAMETER_NAME env var is required');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: INTERVAL_PARAMETER_NAME,
      })
    );

    const intervalMinutes = parseInt(response.Parameter?.Value || '1', 10);

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ intervalMinutes }),
    };
  } catch (err) {
    logger.error('Failed to get interval', { error: String(err) });
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to retrieve interval' }),
    };
  }
}
