import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/aws-config.js';

/**
 * Configured and reusable S3 client
 */
export const s3Client = new S3Client({
  region: awsConfig.region,
  // Optional additional configurations:
  // maxAttempts: 3,
  // requestTimeout: 3000,
});
