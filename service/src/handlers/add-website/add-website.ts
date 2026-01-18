import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

import { WebsitesRepository } from '../../repositories/websites.repository';
import type { AddWebsiteRequest } from '../../types/website';
import { sendSuccess, sendError } from '../../utils/response';

const logger = new Logger();
const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;
// Note: In this simple example, the service layer is intentionally omitted.
// The repository is used directly in the handler for straightforward CRUD operations.
const repository = WEBSITES_TABLE_NAME ? new WebsitesRepository(WEBSITES_TABLE_NAME) : null;

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (!repository) {
    logger.error('WEBSITES_TABLE_NAME env var is required');
    return sendError(500, 'Server not configured');
  }

  try {
    const body: AddWebsiteRequest = JSON.parse(event.body || '{}');
    const { url, contentRequirement } = body;

    if (!url || !contentRequirement) {
      return sendError(400, 'url and contentRequirement are required');
    }

    /* Validate URL format.
     * In a complete project we will have request validation middleware
     * using some third party library like Zod.
    */
    try {
      new URL(url);
    } catch {
      return sendError(400, 'Invalid URL format');
    }

    const website = await repository.add({ url, contentRequirement });

    logger.info('Added website', { url });

    return sendSuccess(201, { website });
  } catch (err) {
    if (err instanceof Error && err.name === 'ConditionalCheckFailedException') {
      logger.warn('Website already exists', { url: JSON.parse(event.body || '{}').url });
      return sendError(409, 'Website URL already exists');
    }
    
    logger.error('Failed to add website', { error: String(err) });
    return sendError(500, 'Failed to add website');
  }
}
