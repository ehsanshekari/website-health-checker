import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { WebsitesRepository } from '../../repositories/websites.repository';
import { sendSuccess, sendError } from '../../utils/response';

const logger = new Logger();
const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;
// Note: In this simple example, the service layer is intentionally omitted.
// The repository is used directly in the handler for straightforward CRUD operations.
const repository = WEBSITES_TABLE_NAME ? new WebsitesRepository(WEBSITES_TABLE_NAME) : null;

export async function handler(): Promise<APIGatewayProxyResultV2> {
  if (!repository) {
    logger.error('WEBSITES_TABLE_NAME env var is required');
    return sendError(500, 'Server not configured');
  }

  try {
    const websites = await repository.list();

    return sendSuccess(200, { websites });
  } catch (err) {
    logger.error('Failed to list websites', { error: String(err) });
    return sendError(500, 'Failed to retrieve websites');
  }
}
