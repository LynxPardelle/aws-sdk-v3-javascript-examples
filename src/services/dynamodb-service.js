import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDBDocClient } from '../clients/dynamodb-client.js';

/**
 * Crear o actualizar un item en DynamoDB
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
    console.error('Error guardando item:', error);
    throw error;
  }
}

/**
 * Obtener un item por su clave primaria
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
    console.error('Error obteniendo item:', error);
    throw error;
  }
}

/**
 * Eliminar un item por su clave primaria
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
    console.error('Error eliminando item:', error);
    throw error;
  }
}

/**
 * Escanear toda la tabla (usar con cuidado en tablas grandes)
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
    console.error('Error escaneando tabla:', error);
    throw error;
  }
}

/**
 * Consultar items usando un índice
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
    console.error('Error consultando items:', error);
    throw error;
  }
}
