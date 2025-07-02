import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from '../config/aws-config.js';

/**
 * Cliente S3 configurado y reutilizable
 */
export const s3Client = new S3Client({
  region: awsConfig.region,
  // Configuraciones adicionales opcionales:
  // maxAttempts: 3,
  // requestTimeout: 3000,
});
