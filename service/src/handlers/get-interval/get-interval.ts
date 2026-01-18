import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

import { sendSuccess, sendError } from '../../utils/response';
import { ConfigurationAdapter } from '../../adapters/configuration.adapter';

const logger = new Logger();
const INTERVAL_PARAMETER_NAME = process.env.INTERVAL_PARAMETER_NAME;
// Note: In this simple example, the service layer is intentionally omitted.
// The adapter is used directly in the handler for straightforward operations.
const adapter = INTERVAL_PARAMETER_NAME ? new ConfigurationAdapter(INTERVAL_PARAMETER_NAME) : null;

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!adapter) {
    logger.error('INTERVAL_PARAMETER_NAME env var is required');
    return sendError(500, 'Server not configured');
  }

  try {
    const intervalMinutes = await adapter.getIntervalMinutes();

    return sendSuccess(200, { intervalMinutes });
  } catch (err) {
    logger.error('Failed to get interval', { error: String(err) });
    return sendError(500, 'Failed to retrieve interval');
  }
}
