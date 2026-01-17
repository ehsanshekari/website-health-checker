import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Logger } from '@aws-lambda-powertools/logger';
import type { Context } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const logger = new Logger();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const WEBSITES_TABLE_NAME = process.env.WEBSITES_TABLE_NAME;

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
