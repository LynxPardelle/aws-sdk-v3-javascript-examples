import {
  ListBucketsCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3-client.js';

/**
 * Listar todos los buckets de S3
 */
export async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return response.Buckets;
  } catch (error) {
    console.error('Error listando buckets:', error);
    throw error;
  }
}

/**
 * Crear un nuevo bucket
 */
export async function createBucket(bucketName) {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error creando bucket:', error);
    throw error;
  }
}

/**
 * Subir un objeto a S3
 */
export async function uploadObject(
  bucketName,
  key,
  body,
  contentType = 'text/plain'
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error subiendo objeto:', error);
    throw error;
  }
}

/**
 * Descargar un objeto de S3
 */
export async function downloadObject(bucketName, key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);

    // Convertir el stream a string
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });

    const bodyContent = await streamToString(response.Body);
    return {
      content: bodyContent,
      metadata: response.Metadata,
      contentType: response.ContentType,
    };
  } catch (error) {
    console.error('Error descargando objeto:', error);
    throw error;
  }
}

/**
 * Eliminar un objeto de S3
 */
export async function deleteObject(bucketName, key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error eliminando objeto:', error);
    throw error;
  }
}
