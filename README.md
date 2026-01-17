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
EventBridge and Lambda are used to check the status of websites.  
Among other reasons, one reason I chose this architecture is that I see multiple-region deployment as a requirement for later. With this architecture, it will obviously be cheaper and easier to maintain compared to running EC2 instances.

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