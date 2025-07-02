/**
 * Advanced examples of signed URLs with S3
 * Real use cases and common patterns
 */

import * as s3Service from '../services/s3-service.js';
import { extractErrorInfo } from '../utils/error-handler.js';

/**
 * Example 1: Temporary download system for users
 * Useful for allowing users to download files for a limited time
 */
export async function createTemporaryDownloadLink(
  bucketName,
  fileKey,
  userEmail,
  durationMinutes = 30
) {
  try {
    const expiresIn = durationMinutes * 60; // Convert to seconds
    const downloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      fileKey,
      expiresIn
    );

    // Here you could save the link in your database with user information
    const linkInfo = {
      user: userEmail,
      fileKey,
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      createdAt: new Date(),
    };

    console.log(`✅ Temporary link created for ${userEmail}:`);
    console.log(`📁 File: ${fileKey}`);
    console.log(`⏰ Expires in: ${durationMinutes} minutes`);
    console.log(`🔗 URL: ${downloadUrl}`);

    return linkInfo;
  } catch (error) {
    console.error('Error creating temporary link:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Example 2: Direct upload from frontend with validations
 * Useful for upload forms without going through your server
 */
export async function createUploadLinkWithValidation(
  bucketName,
  fileName,
  fileType,
  maxSizeBytes = 5 * 1024 * 1024
) {
  try {
    const fileKey = `uploads/${Date.now()}-${fileName}`;
    const expiresIn = 300; // 5 minutes for upload

    // Generate URL with restrictions
    const uploadUrl = await s3Service.getUploadSignedUrl(
      bucketName,
      fileKey,
      fileType,
      expiresIn
    );

    const uploadInfo = {
      uploadUrl,
      fileKey,
      restrictions: {
        maxSize: maxSizeBytes,
        allowedTypes: [fileType],
        expiresIn: expiresIn,
      },
      instructions: {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
        },
      },
    };

    console.log(`✅ Upload URL generated:`);
    console.log(`📁 File: ${fileName} -> ${fileKey}`);
    console.log(
      `📏 Max size: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    );
    console.log(`⏰ Valid for: ${expiresIn / 60} minutes`);

    return uploadInfo;
  } catch (error) {
    console.error('Error creating upload URL:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Example 3: Image gallery with signed URLs
 * Useful for displaying private images in a web gallery
 */
export async function createImageGalleryUrls(
  bucketName,
  imageKeys,
  thumbnailDuration = 60,
  fullSizeDuration = 300
) {
  try {
    const gallery = {};

    for (const imageKey of imageKeys) {
      const thumbnailKey = `thumbnails/${imageKey}`;
      const fullSizeKey = `images/${imageKey}`;

      // URLs for thumbnails (short duration)
      const thumbnailUrl = await s3Service.getDownloadSignedUrl(
        bucketName,
        thumbnailKey,
        thumbnailDuration
      );

      // URLs for full-size images (longer duration)
      const fullSizeUrl = await s3Service.getDownloadSignedUrl(
        bucketName,
        fullSizeKey,
        fullSizeDuration
      );

      gallery[imageKey] = {
        thumbnail: {
          url: thumbnailUrl,
          expiresIn: thumbnailDuration,
        },
        fullSize: {
          url: fullSizeUrl,
          expiresIn: fullSizeDuration,
        },
      };
    }

    console.log(`✅ Gallery of ${imageKeys.length} images generated`);
    console.log(`🖼️ Thumbnails valid for: ${thumbnailDuration / 60} minutes`);
    console.log(
      `📸 Full images valid for: ${fullSizeDuration / 60} minutes`
    );

    return gallery;
  } catch (error) {
    console.error('Error creating gallery:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Example 4: Bulk download system with compression
 * Useful for allowing download of multiple files
 */
export async function createBulkDownloadUrls(
  bucketName,
  fileKeys,
  groupName = 'download',
  durationHours = 2
) {
  try {
    const expiresIn = durationHours * 3600; // Convert to seconds
    const bulkDownload = {
      groupName,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      files: {},
      summary: {
        totalFiles: fileKeys.length,
        estimatedSize: 'Calculating...',
      },
    };

    // Generate URLs in parallel for better performance
    const urlPromises = fileKeys.map(async (fileKey) => {
      const downloadUrl = await s3Service.getDownloadSignedUrl(
        bucketName,
        fileKey,
        expiresIn
      );
      return { fileKey, downloadUrl };
    });

    const results = await Promise.all(urlPromises);

    results.forEach(({ fileKey, downloadUrl }) => {
      bulkDownload.files[fileKey] = {
        downloadUrl,
        fileName: fileKey.split('/').pop(), // Extract file name
      };
    });

    console.log(`✅ Bulk download prepared: ${groupName}`);
    console.log(`📦 ${fileKeys.length} files included`);
    console.log(`⏰ URLs valid for: ${durationHours} hours`);

    return bulkDownload;
  } catch (error) {
    console.error('Error creating bulk download:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Example 5: External API integration
 * Useful for sharing files with third-party services
 */
export async function createAPIIntegrationUrl(
  bucketName,
  fileKey,
  apiName,
  webhookUrl = null
) {
  try {
    const expiresIn = 1800; // 30 minutes for APIs
    const downloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      fileKey,
      expiresIn
    );

    const integration = {
      apiName,
      fileKey,
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      webhook: webhookUrl,
      metadata: {
        fileName: fileKey.split('/').pop(),
        generatedAt: new Date().toISOString(),
        purpose: `Integration with ${apiName}`,
      },
    };

    console.log(`✅ Integration URL generated for: ${apiName}`);
    console.log(`📁 File: ${fileKey}`);
    console.log(`⏰ Valid for: 30 minutes`);

    if (webhookUrl) {
      console.log(`🔔 Webhook configured: ${webhookUrl}`);
    }

    return integration;
  } catch (error) {
    console.error('Error creating integration URL:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Demonstration function that runs all examples
 */
export async function demonstrateAdvancedSignedUrls() {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    console.log('⚠️ S3_BUCKET_NAME not configured for advanced examples');
    return;
  }

  console.log('\n🚀 Demonstrating advanced signed URL use cases:\n');

  try {
    // Upload example files
    await s3Service.uploadObject(
      bucketName,
      'documents/report.pdf',
      'Report content',
      'application/pdf'
    );
    await s3Service.uploadObject(
      bucketName,
      'images/photo1.jpg',
      'Image data 1',
      'image/jpeg'
    );
    await s3Service.uploadObject(
      bucketName,
      'images/photo2.jpg',
      'Image data 2',
      'image/jpeg'
    );

    // Example 1: Temporary link
    console.log('1️⃣ Temporary link for user:');
    await createTemporaryDownloadLink(
      bucketName,
      'documents/report.pdf',
      'user@example.com',
      15
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Example 2: Direct upload
    console.log('2️⃣ Direct upload URL:');
    await createUploadLinkWithValidation(
      bucketName,
      'nuevo-documento.pdf',
      'application/pdf',
      2 * 1024 * 1024
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Example 3: Image gallery
    console.log('3️⃣ Image gallery:');
    await createImageGalleryUrls(
      bucketName,
      ['photo1.jpg', 'photo2.jpg'],
      120,
      600
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Example 4: Bulk download
    console.log('4️⃣ Bulk download:');
    await createBulkDownloadUrls(
      bucketName,
      ['documents/report.pdf', 'images/photo1.jpg', 'images/photo2.jpg'],
      'MyFiles',
      1
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Example 5: API integration
    console.log('5️⃣ External API integration:');
    await createAPIIntegrationUrl(
      bucketName,
      'documents/report.pdf',
      'ProcessingAPI',
      'https://api.example.com/webhook'
    );

    // Clean up example files
    console.log('\n🧹 Cleaning up example files...');
    await s3Service.deleteObject(bucketName, 'documents/report.pdf');
    await s3Service.deleteObject(bucketName, 'images/photo1.jpg');
    await s3Service.deleteObject(bucketName, 'images/photo2.jpg');
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('Error in advanced examples:', extractErrorInfo(error));
  }
}
