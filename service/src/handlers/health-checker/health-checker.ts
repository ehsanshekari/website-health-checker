import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Logger } from '@aws-lambda-powertools/logger';
import type { Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const logger = new Logger();

// Initialize DynamoDB client once (reused across Lambda invocations)
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;
const WEBSITE_STATUS_TABLE_NAME = process.env.WEBSITE_STATUS_TABLE_NAME;

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
    if (!WEBSITES_TABLE_NAME) {
      logger.error('WEBSITES_TABLE_NAME env var is required');
      throw new Error('WEBSITES_TABLE_NAME not configured');
    }

    if (!WEBSITE_STATUS_TABLE_NAME) {
      logger.error('WEBSITE_STATUS_TABLE_NAME env var is required');
      throw new Error('WEBSITE_STATUS_TABLE_NAME not configured');
    }

    // Fetch websites from DynamoDB
    const response = await docClient.send(
      new ScanCommand({
        TableName: WEBSITES_TABLE_NAME,
      })
    );

    const websites = (response.Items || []) as WebsiteConfig[];
    
    if (websites.length === 0) {
      logger.info('No websites configured');
      return { results: [] };
    }

    logger.info('Checking websites', { count: websites.length });

    const results = await Promise.all(
      websites.map((website) => this.checkWebsite(website)),
    );

    // Write all results to DynamoDB status history table
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

  private async saveStatusToHistory(result: CheckResult): Promise<void> {
    try {
      await docClient.send(
        new PutCommand({
          TableName: WEBSITE_STATUS_TABLE_NAME as string,
          Item: {
            url: result.url,
            status: result.status,
            responseTimeMs: result.responseTimeMs,
            statusCode: result.statusCode,
            lastChecked: new Date().toISOString(),
          },
        })
      );
    } catch (error) {
      logger.error('Failed to save status to history', {
        url: result.url,
        error: error instanceof Error ? error.message : String(error),
      });
      // Re-throw to let Promise.allSettled handle it
      throw error;
    }
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
