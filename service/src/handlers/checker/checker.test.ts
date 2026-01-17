import { handler } from './checker';
import type { Context } from 'aws-lambda';

global.fetch = jest.fn();

describe('website-health-checker lambda', () => {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'website-health-checker',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:website-health-checker',
    memoryLimitInMB: '128',
    awsRequestId: 'req-123',
    logGroupName: '/aws/lambda/website-health-checker',
    logStreamName: '2026/01/17/[$LATEST]abc',
    getRemainingTimeInMillis: () => 1000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully checks websites with valid content', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '<html>Welcome to Google</html>',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '<html>Welcome to Yahoo!</html>',
      });

    const result = await handler({}, mockContext);

    expect(result.results).toHaveLength(2);
    expect(result.results[0].status).toBe('success');
    expect(result.results[1].status).toBe('success');
  });

  it('detects content errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html>Some other content</html>',
    });

    const result = await handler({}, mockContext);

    expect(result.results.every((r) => r.status === 'content_error')).toBe(true);
  });

  it('detects connection errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    });

    const result = await handler({}, mockContext);

    expect(result.results.every((r) => r.status === 'connection_error')).toBe(true);
  });

  it('handles network failures', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await handler({}, mockContext);

    expect(result.results.every((r) => r.status === 'connection_error')).toBe(true);
  });
});
