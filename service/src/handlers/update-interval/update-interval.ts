import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

import { sendSuccess, sendError } from '../../utils/response';
import { ConfigurationAdapter } from '../../adapters/configuration.adapter';

const logger = new Logger();
const INTERVAL_PARAMETER_NAME = process.env.INTERVAL_PARAMETER_NAME;
const EVENTBRIDGE_RULE_NAME = process.env.EVENTBRIDGE_RULE_NAME;
const adapter = (INTERVAL_PARAMETER_NAME && EVENTBRIDGE_RULE_NAME) 
  ? new ConfigurationAdapter(INTERVAL_PARAMETER_NAME, EVENTBRIDGE_RULE_NAME) 
  : null;

interface UpdateIntervalRequest {
  intervalMinutes: number;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (!adapter) {
    logger.error('Environment variables not configured');
    return sendError(500, 'Server not configured');
  }

  try {
    const body: UpdateIntervalRequest = JSON.parse(event.body || '{}');
    const { intervalMinutes } = body;

    if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 1440) {
      return sendError(400, 'intervalMinutes must be between 1 and 1440 (24 hours)');
    }

    await adapter.updateIntervalMinutes(intervalMinutes);

    logger.info('Updated interval', { intervalMinutes });

    return sendSuccess(200, { success: true, intervalMinutes });
  } catch (err) {
    logger.error('Failed to update interval', { error: String(err) });
    return sendError(500, 'Failed to update interval');
  }
}
