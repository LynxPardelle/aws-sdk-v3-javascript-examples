import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocClient } from '../clients/dynamodb-client.js';

/**
 * Create or update an item in DynamoDB
 */
export async function putItem(tableName, item) {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    const response = await dynamoDBDocClient.send(command);
    return response;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
}

/**
 * Get an item by its primary key
 */
export async function getItem(tableName, key) {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });
    const response = await dynamoDBDocClient.send(command);
    return response.Item;
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
}

/**
 * Delete an item by its primary key
 */
export async function deleteItem(tableName, key) {
  try {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });
    const response = await dynamoDBDocClient.send(command);
    return response;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

/**
 * Scan entire table (use with caution on large tables)
 */
export async function scanTable(tableName, limit = 25) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
      Limit: limit,
    });
    const response = await dynamoDBDocClient.send(command);
    return {
      items: response.Items,
      count: response.Count,
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error scanning table:', error);
    throw error;
  }
}

/**
 * Query items using an index
 */
export async function queryItems(
  tableName,
  keyConditionExpression,
  expressionAttributeValues
) {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    const response = await dynamoDBDocClient.send(command);
    return {
      items: response.Items,
      count: response.Count,
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
}
