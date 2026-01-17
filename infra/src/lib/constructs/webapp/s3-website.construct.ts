import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface S3WebsiteConstructProps {
  bucketName?: string;
}

export class S3WebsiteConstruct extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly websiteUrl: string;

  constructor(scope: Construct, id: string, props: S3WebsiteConstructProps) {
    super(scope, id);

    const { bucketName } = props;

    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
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
  }
}
