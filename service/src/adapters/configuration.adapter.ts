import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import { EventBridgeClient, PutRuleCommand } from '@aws-sdk/client-eventbridge';

export class ConfigurationAdapter {
  private readonly ssmClient: SSMClient;
  private readonly eventBridgeClient: EventBridgeClient;
  private readonly parameterName: string;
  private readonly eventBridgeRuleName?: string;

  constructor(parameterName: string, eventBridgeRuleName?: string) {
    this.ssmClient = new SSMClient({});
    this.eventBridgeClient = new EventBridgeClient({});
    this.parameterName = parameterName;
    this.eventBridgeRuleName = eventBridgeRuleName;
  }

  async getIntervalMinutes(): Promise<number> {
    const response = await this.ssmClient.send(
      new GetParameterCommand({
        Name: this.parameterName,
      })
    );

    return parseInt(response.Parameter?.Value || '1', 10);
  }

  async updateIntervalMinutes(intervalMinutes: number): Promise<void> {
    if (!this.eventBridgeRuleName) {
      throw new Error('EventBridge rule name not configured');
    }

    await this.ssmClient.send(
      new PutParameterCommand({
        Name: this.parameterName,
        Value: String(intervalMinutes),
        Overwrite: true,
      })
    );

    const rateUnit = intervalMinutes === 1 ? 'minute' : 'minutes';

    await this.eventBridgeClient.send(
      new PutRuleCommand({
        Name: this.eventBridgeRuleName,
        ScheduleExpression: `rate(${intervalMinutes} ${rateUnit})`,
        Description: 'Triggers website health check periodically',
        State: 'ENABLED',
      })
    );
  }
}
