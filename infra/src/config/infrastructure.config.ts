export interface InfrastructureConfig {
  readonly app: {
    readonly name: string;
    readonly serviceName: string;
    readonly stage: string;
  };
  readonly resources: {
    readonly websitesTableName: string;
    readonly websiteStatusTableName: string;
    readonly websiteBucketName?: string;
    readonly apiName: string;
    readonly checkerRuleName: string;
    readonly intervalParameterName: string;
  };
  readonly apiLambda?: {
    readonly timeout?: number; // seconds
    readonly memorySize?: number; // MB
  };
  readonly healthCheckerLambda: {
    readonly lambdaTimeoutSeconds: number; // seconds
    readonly memorySize?: number; // MB
  };
  readonly schedule: {
    readonly defaultIntervalMinutes: number;
  };
}

export const config: InfrastructureConfig = {
  app: {
    name: 'website-monitoring',
    serviceName: 'WebsiteMonitoring',
    stage: 'prod',
  },
  resources: {
    websitesTableName: 'website-monitoring-websites',
    websiteStatusTableName: 'website-monitoring-website-status',
    apiName: 'WebsiteMonitoringApi',
    checkerRuleName: 'website-monitoring-checker-schedule',
    intervalParameterName: '/website-monitoring/check-interval-minutes',
  },
  healthCheckerLambda: {
    lambdaTimeoutSeconds: 300,
  },
  schedule: {
    defaultIntervalMinutes: 1,
  },
};
