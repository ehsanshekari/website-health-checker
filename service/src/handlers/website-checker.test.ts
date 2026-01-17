import { handler } from './website-checker';
import type { Context } from 'aws-lambda';

describe('website-checker lambda', () => {
  it('logs on invocation', async () => {
    const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(((..._args: unknown[]) => true) as any);

    const ctx: Context = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'website-checker',
      functionVersion: '1',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:website-checker',
      memoryLimitInMB: '128',
      awsRequestId: 'req-123',
      logGroupName: '/aws/lambda/website-checker',
      logStreamName: '2026/01/17/[$LATEST]abc',
      getRemainingTimeInMillis: () => 1000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };

    await handler({}, ctx);

    expect(writeSpy).toHaveBeenCalled();
    writeSpy.mockRestore();
  });
});
