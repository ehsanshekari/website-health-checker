import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';
import { EventBridgeClient, PutRuleCommand } from '@aws-sdk/client-eventbridge';

const logger = new Logger();
const ssmClient = new SSMClient({});
const eventBridgeClient = new EventBridgeClient({});

const INTERVAL_PARAMETER_NAME = process.env.INTERVAL_PARAMETER_NAME;
const EVENTBRIDGE_RULE_NAME = process.env.EVENTBRIDGE_RULE_NAME;

interface UpdateIntervalRequest {
  intervalSeconds: number;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (!INTERVAL_PARAMETER_NAME || !EVENTBRIDGE_RULE_NAME) {
    logger.error('Environment variables not configured');
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server not configured' }),
    };
  }

  try {
    const body: UpdateIntervalRequest = JSON.parse(event.body || '{}');
    const { intervalSeconds } = body;

    if (!intervalSeconds || intervalSeconds < 1 || intervalSeconds > 86400) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'intervalSeconds must be between 1 and 86400' }),
      };
    }

    // Update SSM parameter
    await ssmClient.send(
      new PutParameterCommand({
        Name: INTERVAL_PARAMETER_NAME,
        Value: String(intervalSeconds),
        Overwrite: true,
      })
    );

    // Update EventBridge rule schedule
    await eventBridgeClient.send(
      new PutRuleCommand({
        Name: EVENTBRIDGE_RULE_NAME,
        ScheduleExpression: `rate(${intervalSeconds} seconds)`,
        Description: 'Triggers website health check periodically',
        State: 'ENABLED',
      })
    );

    logger.info('Updated interval', { intervalSeconds });

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, intervalSeconds }),
    };
  } catch (err) {
    logger.error('Failed to update interval', { error: String(err) });
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to update interval' }),
    };
  }
}
