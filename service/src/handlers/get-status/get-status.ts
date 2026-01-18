import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

import { sendSuccess, sendError } from '../../utils/response';
import { WebsiteStatusRepository } from '../../repositories/website-status.repository';

const logger = new Logger();
const WEBSITE_STATUS_TABLE_NAME = process.env.WEBSITE_STATUS_TABLE_NAME;
// Note: In this simple example, the service layer is intentionally omitted.
// The repository is used directly in the handler for straightforward CRUD operations.
const repository = WEBSITE_STATUS_TABLE_NAME ? new WebsiteStatusRepository(WEBSITE_STATUS_TABLE_NAME) : null;

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!repository) {
    logger.error('WEBSITE_STATUS_TABLE_NAME env var is required');
    return sendError(500, 'Server not configured');
  }

  try {
    const items = await repository.listAll(logger);

    logger.info('Successfully fetched status', { itemCount: items.length });

    return sendSuccess(200, { 
      generatedAt: new Date().toISOString(), 
      items 
    });
  } catch (err) {
    logger.error('Failed to get latest status', { error: String(err) });
    return sendError(500, 'Failed to fetch status');
  }
}
