## Application Overview
These are two screenshots of the final application. There are two main pages: one shows the health check results in a table, and the other is the settings page, where we can change the check interval and also add or remove websites.
![Screenshot 2026-01-18 142337](docs/Screenshot%202026-01-18%20142337.png)
![Screenshot 2026-01-18 142350](docs/Screenshot%202026-01-18%20142350.png)

## Technologies Used

### Programming Language  
**JavaScript / TypeScript**  
- My everyday programming languages.

### Cloud  
**AWS**  
- The cloud platform I currently use and I know about.

### Infrastructure as Code  
**AWS CDK**  
- My first choice when working within the AWS ecosystem.

### CI/CD Pipelines  
**GitHub Actions**  
- Used to keep pipelines in the repository.
- These days, I am personally leaning more toward AWS CodeBuild and AWS CodePipeline.


## Repository Structure

This repository is organized as a **monorepo** to keep everything in one place and make it easy to share.  
It contains **three main projects**:

### `/infra`
- An **AWS CDK** project that defines all infrastructure as code.

### `/service`
- Backend APIs implemented as Lambda functions.

### `/webapp`
- A simple **React** application for the frontend, generated entirely by AI. I haven’t even checked the code myself, as it’s an optional part of this exercise!

Some level of consistency and teamwork are enforced through code formatting, linting, and commit hooks that format code, validate Conventional Commits, and run tests.
In addition, templates for pull requests, new features, and issues are provided in the .github folder.

## AWS Services used

### EventBridge + Lambda (website health checker)
EventBridge and Lambda are used to check the status of websites, which requires less maintenance, and logs are sent directly to CloudWatch.
Also, this task does not need an always-running architecture, and serverless can save costs.

In addition, multi-region deployment, which will be a requirement in the future, will obviously be cheaper, easier to maintain, and require less operational overhead compared to running EC2 instances.

### CloudWatch
CloudWatch is used for logs.

### Parameter Store
Parameter Store is used to store and update the interval that invokes the website health checker Lambda.  
This allows changing the schedule without redeploying anything.

### API Gateway + Lambdas
API Gateway and Lambdas are used to provide the backend API.

### S3 (static website hosting)
S3 is used as a static website to host the frontend. (At the moment, there is no SSL/TLS certificate, CDN, or user authentication)

### DynamoDB
DynamoDB is used to store the website list and to store the latest status.

For this project, all the resources are created within a single stack, but through dedicated constructs.

## Design Question and Answer
### What if we want multi-region latency measurements?
There can be several possible solutions.

First, we need to remember to use HTTPS, and then we need to deploy a health checker Lambda and an EventBridge rule in each region.

One simple approach is to use a central data store in a primary region (for example, DynamoDB), along with a Lambda function behind an API Gateway that acts as a central data collector.

For security, this data collector Lambda should be protected with IAM and signed requests, so only our own Lambdas from other regions can invoke it and send data securely using signed requests.

## Future Improvements
- The code can be improved in multiple ways, including adding middlewares for validations, custom error classes, custom adapters, a service layer, and so on.
- Alerts can be sent, for example via email or SMS, when a website is down for a specific number of minutes.
- More reusable constructs, code reuse, and possibly stacks can be added, along with proper tagging for cost tracking.
- HTTPS needs to be added; AWS Certificate Manager can be used.
- If a dashboard needs to be live and provide user access, AWS Cognito can be used.
- We also need a nice URL using Route 53 DNS.
- We can store the history of website statuses in a DynamoDB table.




