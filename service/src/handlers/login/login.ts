import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { sendSuccess, sendError } from '../../utils/response';

const logger = new Logger();

// Hardcoded credentials - NOTE: This is for demo purposes only!
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'notsecure';

interface LoginRequest {
  username: string;
  password: string;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const body: LoginRequest = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return sendError(400, 'Username and password are required');
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      logger.info('Successful login', { username });
      
      // In a real app, generate and return a JWT token or session ID
      return sendSuccess(200, { 
        success: true,
        message: 'Login successful',
        token: Buffer.from(`${username}:${Date.now()}`).toString('base64')
      });
    }

    logger.warn('Failed login attempt', { username });
    return sendError(401, 'Invalid username or password');
  } catch (err) {
    logger.error('Login error', { error: String(err) });
    return sendError(500, 'Login failed');
  }
}
