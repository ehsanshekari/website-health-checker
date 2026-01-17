import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Logger } from '@aws-lambda-powertools/logger';
import type { Context } from 'aws-lambda';

const logger = new Logger();

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  async handler(_event: unknown, _context: Context) {
    void _event;
    void _context;
    logger.info('Simple powertools logger lambda invoked');
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
