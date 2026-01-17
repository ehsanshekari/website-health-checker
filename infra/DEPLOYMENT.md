# Deploying Website Monitoring Lambda

This guide walks through deploying your Lambda function to AWS using CDK.

## Prerequisites

- AWS CLI installed and configured with credentials
- AWS account with appropriate permissions
- Node.js and pnpm installed

## Project Structure

```
infra/
├── lib/
│   ├── constructs/
│   │   └── website-checker-lambda.construct.ts  # Lambda construct
│   ├── stacks/
│   │   └── website-monitoring.stack.ts          # Main stack
│   └── config/                                  # Configuration (optional)
├── bin/
│   └── infra.ts                                 # CDK app entry point
└── package.json
```

## Deployment Steps

### 1. Bootstrap CDK (First Time Only)

If you haven't bootstrapped CDK in your AWS account/region before:

```powershell
cd infra
pnpm run cdk bootstrap
```

This creates the necessary S3 bucket and ECR repository for CDK deployments.

### 2. Build the Infrastructure

```powershell
pnpm --filter website-monitoring-infra run build
```

### 3. Synthesize CloudFormation Template (Optional)

Preview the CloudFormation template that will be deployed:

```powershell
pnpm --filter website-monitoring-infra run cdk synth
```

### 4. Deploy the Stack

```powershell
pnpm --filter website-monitoring-infra run cdk deploy
```

This will:
- Bundle your Lambda code with esbuild
- Upload the Lambda package to S3
- Create the Lambda function
- Create the IAM role
- Create CloudWatch Log Group

You'll be prompted to approve IAM changes. Type `y` to proceed.

### 5. Test the Lambda

After deployment, you'll see outputs including the function name and ARN. Test it:

```powershell
aws lambda invoke --function-name <function-name> response.json
cat response.json
```

## Useful Commands

### View Stack Differences

See what changes would be deployed:

```powershell
pnpm --filter website-monitoring-infra run cdk diff
```

### Destroy the Stack

Remove all resources:

```powershell
pnpm --filter website-monitoring-infra run cdk destroy
```

### List All Stacks

```powershell
pnpm --filter website-monitoring-infra run cdk list
```

## Stack Outputs

After deployment, you'll see:

- **WebsiteCheckerFunctionName**: The Lambda function name
- **WebsiteCheckerFunctionArn**: The Lambda function ARN

## Customizing the Lambda

Edit [lib/constructs/website-checker-lambda.construct.ts](lib/constructs/website-checker-lambda.construct.ts):

```typescript
new WebsiteCheckerLambda(this, 'WebsiteChecker', {
  timeout: cdk.Duration.seconds(60),        // Increase timeout
  memorySize: 512,                          // Increase memory
  environment: {
    API_URL: 'https://example.com',         // Add environment variables
    LOG_LEVEL: 'INFO',
  },
});
```

## Troubleshooting

### Error: Need to perform AWS calls for account

Run: `pnpm run cdk bootstrap`

### Error: Docker not found

The construct uses `forceDockerBundling: false` to use local esbuild instead of Docker.

### Lambda import errors

Check that [service/package.json](../service/package.json) includes all required dependencies.
