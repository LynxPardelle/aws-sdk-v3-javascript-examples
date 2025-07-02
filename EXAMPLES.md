# Ejemplos Adicionales AWS SDK v3

Este archivo contiene ejemplos más avanzados para diferentes casos de uso.

## 📋 Casos de Uso Comunes

### 1. Configuración con AWS SSO

```javascript
// src/config/sso-config.js
import { fromSSO } from '@aws-sdk/credential-providers';

export const ssoCredentials = fromSSO({
  profile: 'my-sso-profile',
});

// Usar en cliente
import { S3Client } from '@aws-sdk/client-s3';
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: ssoCredentials,
});
```

### 2. Paginación en DynamoDB

```javascript
// src/examples/pagination-example.js
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocClient } from '../clients/dynamodb-client.js';

export async function scanAllItems(tableName) {
  const items = [];
  let lastEvaluatedKey = undefined;

  do {
    const params = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
      Limit: 25,
    };

    const result = await dynamoDBDocClient.send(new ScanCommand(params));
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}
```

### 3. Upload de archivos grandes a S3 con progreso

```javascript
// src/examples/multipart-upload.js
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client } from '../clients/s3-client.js';
import fs from 'fs';

export async function uploadLargeFile(bucketName, key, filePath) {
  const fileStream = fs.createReadStream(filePath);
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024, // 5MB parts
  });

  upload.on('httpUploadProgress', (progress) => {
    console.log(`Uploaded: ${progress.loaded}/${progress.total} bytes`);
  });

  return await upload.done();
}
```

### 4. Transacciones en DynamoDB

```javascript
// src/examples/transactions.js
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocClient } from '../clients/dynamodb-client.js';

export async function transferPoints(fromUser, toUser, points, tableName) {
  const transactParams = {
    TransactItems: [
      {
        Update: {
          TableName: tableName,
          Key: { userId: fromUser },
          UpdateExpression: 'SET points = points - :points',
          ConditionExpression: 'points >= :points',
          ExpressionAttributeValues: { ':points': points },
        },
      },
      {
        Update: {
          TableName: tableName,
          Key: { userId: toUser },
          UpdateExpression: 'SET points = points + :points',
          ExpressionAttributeValues: { ':points': points },
        },
      },
    ],
  };

  return await dynamoDBDocClient.send(new TransactWriteCommand(transactParams));
}
```

### 5. Presigned URLs para S3

```javascript
// src/examples/presigned-urls.js
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3-client.js';

export async function createDownloadUrl(bucketName, key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function createUploadUrl(bucketName, key, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}
```

### 6. Configuración con Variables de Entorno por Ambiente

```javascript
// src/config/environment.js
const environments = {
  development: {
    region: 'us-east-1',
    s3Bucket: 'my-dev-bucket',
    dynamoTable: 'my-dev-table',
  },
  staging: {
    region: 'us-east-1',
    s3Bucket: 'my-staging-bucket',
    dynamoTable: 'my-staging-table',
  },
  production: {
    region: 'us-west-2',
    s3Bucket: 'my-prod-bucket',
    dynamoTable: 'my-prod-table',
  },
};

export const currentEnvironment = environments[process.env.NODE_ENV || 'development'];
```

### 7. Logging Estructurado

```javascript
// src/utils/logger.js
export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  error: (message, error = {}, meta = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
};
```

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca hardcodees credenciales en el código**
2. **Usa roles IAM cuando sea posible**
3. **Implementa principio de menor privilegio**
4. **Rota credenciales regularmente**
5. **Usa AWS Secrets Manager para datos sensibles**
6. **Habilita logging y monitoreo**

## 🚀 Optimización de Rendimiento

1. **Reutiliza clientes AWS**
2. **Configura timeouts apropiados**
3. **Usa paginación para consultas grandes**
4. **Implementa pooling de conexiones**
5. **Considera usar batch operations**
6. **Configura retry logic apropiado**
