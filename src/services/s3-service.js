import {
  ListBucketsCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

/**
 * Generar URL firmada para descargar un objeto de S3
 * @param {string} bucketName - Nombre del bucket
 * @param {string} key - Clave del objeto
 * @param {number} expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
 * @returns {Promise<string>} URL firmada para descarga
 */
export async function getDownloadSignedUrl(bucketName, key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generando URL firmada para descarga:', error);
    throw error;
  }
}

/**
 * Generar URL firmada para subir un objeto a S3
 * @param {string} bucketName - Nombre del bucket
 * @param {string} key - Clave del objeto
 * @param {string} contentType - Tipo de contenido del archivo
 * @param {number} expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
 * @returns {Promise<string>} URL firmada para upload
 */
export async function getUploadSignedUrl(
  bucketName,
  key,
  contentType = 'application/octet-stream',
  expiresIn = 3600
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generando URL firmada para upload:', error);
    throw error;
  }
}

/**
 * Generar múltiples URLs firmadas para descarga
 * @param {string} bucketName - Nombre del bucket
 * @param {string[]} keys - Array de claves de objetos
 * @param {number} expiresIn - Tiempo de expiración en segundos
 * @returns {Promise<Object>} Objeto con las URLs firmadas indexadas por clave
 */
export async function getMultipleDownloadSignedUrls(
  bucketName,
  keys,
  expiresIn = 3600
) {
  try {
    const signedUrls = {};

    // Generar URLs firmadas en paralelo para mejor rendimiento
    const urlPromises = keys.map(async (key) => {
      const url = await getDownloadSignedUrl(bucketName, key, expiresIn);
      return { key, url };
    });

    const results = await Promise.all(urlPromises);

    // Convertir array a objeto para fácil acceso
    results.forEach(({ key, url }) => {
      signedUrls[key] = url;
    });

    return signedUrls;
  } catch (error) {
    console.error('Error generando múltiples URLs firmadas:', error);
    throw error;
  }
}
