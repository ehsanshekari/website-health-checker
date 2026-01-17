#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WebsiteMonitoringStack } from '../lib/stacks/website-monitoring.stack';

const app = new cdk.App();
new WebsiteMonitoringStack(app, 'WebsiteMonitoringStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});
