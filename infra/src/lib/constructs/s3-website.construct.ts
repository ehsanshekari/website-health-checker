import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface S3WebsiteConstructProps {
  /** Name for the S3 bucket (must be globally unique) */
  bucketName?: string;
  /** Path to the webapp build output directory */
  websiteDistPath: string;
}

/**
 * Creates an S3 bucket configured for static website hosting
 */
export class S3WebsiteConstruct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly websiteUrl: string;

  constructor(scope: Construct, id: string, props: S3WebsiteConstructProps) {
    super(scope, id);

    const { bucketName, websiteDistPath } = props;

    // Create S3 bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA routing support
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.websiteUrl = this.bucket.bucketWebsiteUrl;

    // Deploy website content to S3
    new s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
      sources: [s3deploy.Source.asset(websiteDistPath)],
      destinationBucket: this.bucket,
    });
  }
}
