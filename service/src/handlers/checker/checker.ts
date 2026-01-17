import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Logger } from '@aws-lambda-powertools/logger';
import type { Context } from 'aws-lambda';
import config from './checker.config.json';

const logger = new Logger();

interface WebsiteConfig {
  url: string;
  contentRequirement: string;
}

interface CheckResult {
  url: string;
  status: 'success' | 'connection_error' | 'content_error';
  responseTimeMs: number;
  statusCode?: number;
}

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  // @typescript-eslint/no-unused-vars
  async handler(_event: unknown, _context: Context) {
    logger.info('Checking websites', { count: config.websites.length });

    const results = await Promise.all(
      config.websites.map((website) => this.checkWebsite(website)),
    );

    return { results };
  }

  private async checkWebsite(website: WebsiteConfig): Promise<CheckResult> {
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
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
