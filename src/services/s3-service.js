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
 * List all S3 buckets
 */
export async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return response.Buckets;
  } catch (error) {
    console.error('Error listing buckets:', error);
    throw error;
  }
}

/**
 * Create a new bucket
 */
export async function createBucket(bucketName) {
  try {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }
}

/**
 * Upload an object to S3
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
    console.error('Error uploading object:', error);
    throw error;
  }
}

/**
 * Download an object from S3
 */
export async function downloadObject(bucketName, key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const response = await s3Client.send(command);

    // Convert the stream to string
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
    console.error('Error downloading object:', error);
    throw error;
  }
}

/**
 * Delete an object from S3
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
    console.error('Error deleting object:', error);
    throw error;
  }
}

/**
 * Generate signed URL to download an object from S3
 * @param {string} bucketName - Bucket name
 * @param {string} key - Object key
 * @param {number} expiresIn - Expiration time in seconds (default 1 hour)
 * @returns {Promise<string>} Signed URL for download
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
    console.error('Error generating signed URL for download:', error);
    throw error;
  }
}

/**
 * Generate signed URL to upload an object to S3
 * @param {string} bucketName - Bucket name
 * @param {string} key - Object key
 * @param {string} contentType - File content type
 * @param {number} expiresIn - Expiration time in seconds (default 1 hour)
 * @returns {Promise<string>} Signed URL for upload
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
    console.error('Error generating signed URL for upload:', error);
    throw error;
  }
}

/**
 * Generate multiple signed URLs for download
 * @param {string} bucketName - Bucket name
 * @param {string[]} keys - Array of object keys
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<Object>} Object with signed URLs indexed by key
 */
export async function getMultipleDownloadSignedUrls(
  bucketName,
  keys,
  expiresIn = 3600
) {
  try {
    const signedUrls = {};

    // Generate signed URLs in parallel for better performance
    const urlPromises = keys.map(async (key) => {
      const url = await getDownloadSignedUrl(bucketName, key, expiresIn);
      return { key, url };
    });

    const results = await Promise.all(urlPromises);

    // Convert array to object for easy access
    results.forEach(({ key, url }) => {
      signedUrls[key] = url;
    });

    return signedUrls;
  } catch (error) {
    console.error('Error generating multiple signed URLs:', error);
    throw error;
  }
}
