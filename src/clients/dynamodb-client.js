import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../config/aws-config.js';

/**
 * Cliente DynamoDB básico
 */
const dynamoDBClient = new DynamoDBClient({
  region: awsConfig.region,
});

/**
 * Cliente DynamoDB Document (más fácil de usar para operaciones CRUD)
 */
export const dynamoDBDocClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export { dynamoDBClient };
