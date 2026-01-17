import { Construct } from 'constructs';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';

export interface EventBridgeScheduleProps {
  readonly targetFunction: IFunction;
  readonly intervalMinutes: number;
  readonly ruleName: string;
  readonly description?: string;
}

export class EventBridgeSchedule extends Construct {
  public readonly rule: Rule;

  constructor(scope: Construct, id: string, props: EventBridgeScheduleProps) {
    super(scope, id);

    this.rule = new Rule(this, 'ScheduleRule', {
      schedule: Schedule.rate(Duration.minutes(props.intervalMinutes)),
      description:
        props.description ??
        `Triggers Lambda every ${props.intervalMinutes} minutes`,
      ruleName: props.ruleName,
    });

    this.rule.addTarget(new LambdaFunction(props.targetFunction));
  }
}
