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
  intervalMinutes: number;
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
    const { intervalMinutes } = body;

    if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 1440) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'intervalMinutes must be between 1 and 1440 (24 hours)' }),
      };
    }

    // Update SSM parameter
    await ssmClient.send(
      new PutParameterCommand({
        Name: INTERVAL_PARAMETER_NAME,
        Value: String(intervalMinutes),
        Overwrite: true,
      })
    );

    // Update EventBridge rule schedule
    const rateUnit = intervalMinutes === 1 ? 'minute' : 'minutes';
    
    await eventBridgeClient.send(
      new PutRuleCommand({
        Name: EVENTBRIDGE_RULE_NAME,
        ScheduleExpression: `rate(${intervalMinutes} ${rateUnit})`,
        Description: 'Triggers website health check periodically',
        State: 'ENABLED',
      })
    );

    logger.info('Updated interval', { intervalMinutes });

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, intervalMinutes }),
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
