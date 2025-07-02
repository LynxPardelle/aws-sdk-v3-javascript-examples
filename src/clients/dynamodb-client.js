import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../config/aws-config.js';

/**
 * Basic DynamoDB client
 */
const dynamoDBClient = new DynamoDBClient({
  region: awsConfig.region,
});

/**
 * DynamoDB Document client (easier to use for CRUD operations)
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
