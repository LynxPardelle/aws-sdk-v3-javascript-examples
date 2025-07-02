import 'dotenv/config';

/**
 * Centralized configuration for AWS SDK
 */
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  // The SDK will automatically use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from environment
  // or the profile configured in AWS_PROFILE
};

/**
 * Project-specific configuration
 */
export const projectConfig = {
  s3: {
    bucketName: process.env.S3_BUCKET_NAME,
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME,
  },
};

/**
 * Validate that required environment variables are configured
 */
export function validateConfig() {
  const required = ['AWS_REGION'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
