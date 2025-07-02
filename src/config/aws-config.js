import 'dotenv/config';

/**
 * Configuración centralizada para AWS SDK
 */
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  // El SDK automáticamente usará AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY del entorno
  // o el perfil configurado en AWS_PROFILE
};

/**
 * Configuración específica del proyecto
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
 * Validar que las variables de entorno requeridas estén configuradas
 */
export function validateConfig() {
  const required = ['AWS_REGION'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}
