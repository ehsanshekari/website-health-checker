import { Construct } from 'constructs';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';

export interface EventBridgeScheduleProps {
  /**
   * The Lambda function to trigger
   */
  readonly targetFunction: IFunction;
  
  /**
   * Interval in seconds between executions
   */
  readonly intervalSeconds: number;
  
  /**
   * Optional description for the EventBridge rule
   */
  readonly description?: string;
  
  /**
   * Optional rule name
   */
  readonly ruleName?: string;
}

/**
 * EventBridge construct that triggers a Lambda function on a schedule
 */
export class EventBridgeSchedule extends Construct {
  public readonly rule: Rule;

  constructor(scope: Construct, id: string, props: EventBridgeScheduleProps) {
    super(scope, id);

    // Create EventBridge rule with rate schedule
    this.rule = new Rule(this, 'ScheduleRule', {
      schedule: Schedule.rate(Duration.seconds(props.intervalSeconds)),
      description: props.description ?? `Triggers Lambda every ${props.intervalSeconds} seconds`,
      ruleName: props.ruleName,
    });

    // Add the Lambda function as a target
    this.rule.addTarget(new LambdaFunction(props.targetFunction));
  }
}
