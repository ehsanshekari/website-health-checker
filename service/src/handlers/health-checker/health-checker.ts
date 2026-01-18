import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Logger } from '@aws-lambda-powertools/logger';
import type { Context } from 'aws-lambda';
import { WebsitesRepository } from '../../repositories/websites.repository';
import { WebsiteStatusRepository } from '../../repositories/website-status.repository';
import type { Website } from '../../types/website';

const logger = new Logger();

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;
const WEBSITE_STATUS_TABLE_NAME = process.env.WEBSITE_STATUS_TABLE_NAME;

// Note: In this simple example, the service layer is intentionally omitted.
// The repositories are used directly in the handler for straightforward operations.
const websitesRepo = WEBSITES_TABLE_NAME ? new WebsitesRepository(WEBSITES_TABLE_NAME) : null;
const statusRepo = WEBSITE_STATUS_TABLE_NAME ? new WebsiteStatusRepository(WEBSITE_STATUS_TABLE_NAME) : null;

interface CheckResult {
  url: string;
  status: 'success' | 'connection_error' | 'content_error';
  responseTimeMs: number;
  statusCode?: number;
}

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  async handler(_event: unknown, _context: Context) {
    if (!websitesRepo) {
      logger.error('WEBSITES_TABLE_NAME env var is required');
      throw new Error('WEBSITES_TABLE_NAME not configured');
    }

    if (!statusRepo) {
      logger.error('WEBSITE_STATUS_TABLE_NAME env var is required');
      throw new Error('WEBSITE_STATUS_TABLE_NAME not configured');
    }

    const websites = await websitesRepo.list();
    
    if (websites.length === 0) {
      logger.info('No websites configured');
      return { results: [] };
    }

    logger.info('Checking websites', { count: websites.length });

    const results = await Promise.all(
      websites.map((website) => this.checkWebsite(website)),
    );

    const writeResults = await Promise.allSettled(
      results.map((result) => this.saveStatusToHistory(result)),
    );

    // Log any write failures
    const failedWrites = writeResults.filter((r) => r.status === 'rejected');
    if (failedWrites.length > 0) {
      logger.warn('Some status writes failed', { 
        failedCount: failedWrites.length,
        totalCount: results.length,
      });
    }

    return { results };
  }

  private async checkWebsite(website: Website): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(website.url);
      const responseTimeMs = Date.now() - startTime;
      const responseText = await response.text();

      if (!response.ok) {
        logger.error(`Connection error: ${website.url}`, {
          status: response.status,
          responseTimeMs,
        });
        return {
          url: website.url,
          status: 'connection_error',
          responseTimeMs,
          statusCode: response.status,
        };
      }

      if (
        !responseText
          .toLowerCase()
          .includes(website.contentRequirement.toLowerCase())
      ) {
        logger.warn(`Content error: ${website.url}`, { responseTimeMs });
        return {
          url: website.url,
          status: 'content_error',
          responseTimeMs,
          statusCode: response.status,
        };
      }

      logger.info(`Success: ${website.url}`, { responseTimeMs });
      return {
        url: website.url,
        status: 'success',
        responseTimeMs,
        statusCode: response.status,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      logger.error(`Connection failed: ${website.url}`, {
        error: String(error),
        responseTimeMs,
      });
      return {
        url: website.url,
        status: 'connection_error',
        responseTimeMs,
      };
    }
  }

  private async saveStatusToHistory(result: CheckResult): Promise<void> {
    if (!statusRepo) {
      throw new Error('Status repository not initialized');
    }

    try {
      await statusRepo.save({
        url: result.url,
        status: result.status,
        responseTimeMs: result.responseTimeMs,
        statusCode: result.statusCode,
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to save status to history', {
        url: result.url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
