import { validateConfig } from './config/aws-config.js';
import * as s3Service from './services/s3-service.js';
import * as dynamoService from './services/dynamodb-service.js';
import { extractErrorInfo, withRetry } from './utils/error-handler.js';
import { demonstrateAdvancedSignedUrls } from './examples/signed-urls-advanced.js';

/**
 * Main demonstration function
 */
async function main() {
  try {
    // Validate configuration
    validateConfig();
    console.log('✅ AWS configuration validated');

    // S3 example
    console.log('\n📦 S3 examples:');
    await demonstrateS3();

    // DynamoDB example
    console.log('\n🗄️ DynamoDB examples:');
    await demonstrateDynamoDB();

    // Advanced signed URL examples
    console.log('\n🎯 Advanced signed URL examples:');
    await demonstrateAdvancedSignedUrls();
  } catch (error) {
    console.error('❌ Application error:', extractErrorInfo(error));
    process.exit(1);
  }
}

/**
 * S3 operations demonstration
 */
async function demonstrateS3() {
  try {
    // List buckets
    const buckets = await withRetry(() => s3Service.listBuckets());
    console.log('Available buckets:', buckets?.length || 0);

    if (buckets && buckets.length > 0) {
      buckets.forEach((bucket) => {
        console.log(`  - ${bucket.Name} (created: ${bucket.CreationDate})`);
      });
    }

    if (process.env.S3_BUCKET_NAME) {
      const bucketName = process.env.S3_BUCKET_NAME;
      if (bucketName) {
        const testKey = 'test-file.txt';
        const testContent = 'Hello from AWS SDK v3!';

        console.log(`\nUploading file to ${bucketName}/${testKey}...`);
        await s3Service.uploadObject(bucketName, testKey, testContent);
        console.log('✅ File uploaded successfully');

        console.log('Downloading file...');
        const downloaded = await s3Service.downloadObject(bucketName, testKey);
        console.log('Downloaded content:', downloaded.content);
        console.log('Metadata:', downloaded.metadata);
        console.log('Content type:', downloaded.contentType);

        console.log(`\nDeleting file ${bucketName}/${testKey}...`);
        await s3Service.deleteObject(bucketName, testKey);
        console.log('✅ File deleted successfully');
      }
    }

    // Signed URLs examples
    console.log('\n🔗 Signed URLs examples:');
    await demonstrateSignedUrls();
  } catch (error) {
    console.error('Error in S3 demonstration:', extractErrorInfo(error));
  }
}

/**
 * S3 signed URLs demonstration
 */
async function demonstrateSignedUrls() {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.log(
        '⚠️ S3_BUCKET_NAME not configured, skipping signed URL examples'
      );
      return;
    }

    const testKey = 'signed-url-example.txt';
    const testContent = 'This file was created to demonstrate signed URLs';

    // 1. Upload a file to generate download URLs
    console.log(
      `Uploading file ${testKey} for signed URL examples...`
    );
    await s3Service.uploadObject(bucketName, testKey, testContent);

    // 2. Generate signed URL for download (valid for 1 hour)
    console.log('\n🔽 Generating signed URL for download (1 hour):');
    const downloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      testKey,
      3600
    );
    console.log('Download URL:', downloadUrl);
    console.log('⏰ This URL expires in 1 hour');

    // 3. Generate signed URL for download (valid for 5 minutes)
    console.log('\n🔽 Generating signed URL for download (5 minutes):');
    const shortDownloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      testKey,
      300
    );
    console.log('Download URL (short duration):', shortDownloadUrl);
    console.log('⏰ This URL expires in 5 minutes');

    // 4. Generate signed URL for upload
    console.log('\n🔼 Generating signed URL for upload:');
    const uploadKey = 'uploaded-via-signed-url.txt';
    const uploadUrl = await s3Service.getUploadSignedUrl(
      bucketName,
      uploadKey,
      'text/plain',
      3600
    );
    console.log('Upload URL:', uploadUrl);
    console.log(
      '📝 You can use this URL to upload files directly from the frontend'
    );
    console.log('📋 Usage example with fetch:');
    console.log(`
      fetch('${uploadUrl}', {
        method: 'PUT',
        body: 'File content',
        headers: {
          'Content-Type': 'text/plain'
        }
      }).then(response => {
        if (response.ok) {
          console.log('File uploaded successfully');
        }
      });
    `);

    // 5. Generate multiple signed URLs
    console.log('\n📦 Generating multiple signed URLs:');
    const keys = [testKey, 'another-file.txt', 'image.jpg'];

    // First upload some additional files for the example
    await s3Service.uploadObject(
      bucketName,
      'another-file.txt',
      'Another file content'
    );
    await s3Service.uploadObject(
      bucketName,
      'image.jpg',
      'Simulated image data',
      'image/jpeg'
    );

    const multipleUrls = await s3Service.getMultipleDownloadSignedUrls(
      bucketName,
      keys,
      1800
    ); // 30 minutes
    console.log('Multiple URLs generated:');
    Object.entries(multipleUrls).forEach(([key, url]) => {
      console.log(`  📄 ${key}: ${url}`);
    });

    // 6. Clean up example files
    console.log('\n🧹 Cleaning up example files...');
    await s3Service.deleteObject(bucketName, testKey);
    await s3Service.deleteObject(bucketName, 'another-file.txt');
    await s3Service.deleteObject(bucketName, 'image.jpg');
    console.log('✅ Example files deleted');

    console.log('\n💡 Common use cases for signed URLs:');
    console.log('  • Allow temporary download of private files');
    console.log(
      '  • Direct upload from frontend without exposing AWS credentials'
    );
    console.log(
      '  • Share files with external users for limited time'
    );
    console.log('  • Integration with third-party applications');
    console.log('  • Granular temporary access control to resources');
  } catch (error) {
    console.error(
      'Error in signed URLs demonstration:',
      extractErrorInfo(error)
    );
  }
}

/**
 * DynamoDB operations demonstration
 */
// eslint-disable-next-line no-unused-vars
async function demonstrateDynamoDB() {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
      console.log(
        '⚠️ DYNAMODB_TABLE_NAME not configured, skipping DynamoDB examples'
      );
      return;
    }

    // Example of creating an item
    const testItem = {
      id: 'test-id-' + Date.now(),
      name: 'Example from AWS SDK v3',
      timestamp: new Date().toISOString(),
    };

    console.log('Saving item to DynamoDB...');
    await dynamoService.putItem(tableName, testItem);
    console.log('✅ Item saved:', testItem.id);

    // Example of getting the item
    console.log('Getting item...');
    const retrievedItem = await dynamoService.getItem(tableName, {
      id: testItem.id,
    });
    console.log('Retrieved item:', retrievedItem);

    // Example of scanning table
    console.log('Scanning table...');
    const scanResult = await dynamoService.scanTable(tableName, 5);
    console.log(`Found ${scanResult.count} items`);

    // Example of deleting the item
    console.log('Deleting item...');
    await dynamoService.deleteItem(tableName, { id: testItem.id });
    console.log('✅ Item deleted:', testItem.id);

    // Verify that the item was deleted
    const deletedItem = await dynamoService.getItem(tableName, {
      id: testItem.id,
    });
    if (!deletedItem) {
      console.log('✅ Item deleted correctly, not found in table');
    } else {
      console.error('⚠️ Item still exists in table:', deletedItem);
    }
  } catch (error) {
    console.error('Error in DynamoDB demonstration:', extractErrorInfo(error));
  }
}

// Run the application
main();
