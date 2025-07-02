# AWS SDK v3 JavaScript Examples

A minimal project with best practices for using AWS SDK v3 with Node.js.

## 🚀 Features

- ✅ **Modular configuration** with environment variables
- ✅ **Reusable clients** for S3 and DynamoDB
- ✅ **Robust error handling** with automatic retry
- ✅ **Organized structure** by services
- ✅ **ESLint and Prettier** configured
- ✅ **Basic tests** included
- ✅ **ESM (ES Modules)** native support

## 📁 Project Structure

```
src/
├── config/
│   └── aws-config.js       # Centralized AWS configuration
├── clients/
│   ├── s3-client.js        # Configured S3 client
│   └── dynamodb-client.js  # Configured DynamoDB client
├── services/
│   ├── s3-service.js       # S3 operations
│   └── dynamodb-service.js # DynamoDB operations
├── utils/
│   └── error-handler.js    # Error handling utilities
├── tests/
│   ├── config.test.js      # Configuration tests
│   └── error-handler.test.js # Error handler tests
└── index.js                # Main entry point
```

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd aws-sdk-v3-javascript-examples
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your AWS credentials:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   
   # Optional: for specific examples
   S3_BUCKET_NAME=your-bucket-name
   DYNAMODB_TABLE_NAME=your-table-name
   ```

## 🔐 AWS Configuration

### Option 1: Environment Variables
Configure variables in your `.env` file:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Option 2: AWS Profile
If you have profiles configured with AWS CLI:
```env
AWS_PROFILE=your-profile
AWS_REGION=us-east-1
```

### Option 3: IAM Roles (Recommended for production)
For applications running on EC2, Lambda, etc., the SDK will automatically use associated IAM roles.

## 🏃‍♂️ Usage

### Run the application:
```bash
npm start
```

### Development mode (with watch):
```bash
npm run dev
```

### Run tests:
```bash
npm test
```

### Linting and formatting:
```bash
npm run lint          # Check code
npm run lint:fix      # Fix issues automatically
npm run format        # Format code with Prettier
```

## 📝 Usage Examples

### S3 Operations

```javascript
import * as s3Service from './services/s3-service.js';

// List buckets
const buckets = await s3Service.listBuckets();

// Upload file
await s3Service.uploadObject('my-bucket', 'file.txt', 'content');

// Download file
const file = await s3Service.downloadObject('my-bucket', 'file.txt');

// Delete file
await s3Service.deleteObject('my-bucket', 'file.txt');
```

### DynamoDB Operations

```javascript
import * as dynamoService from './services/dynamodb-service.js';

// Create/update item
await dynamoService.putItem('my-table', {
  id: '123',
  name: 'John',
  email: 'john@example.com'
});

// Get item
const item = await dynamoService.getItem('my-table', { id: '123' });

// Delete item
await dynamoService.deleteItem('my-table', { id: '123' });

// Scan table
const result = await dynamoService.scanTable('my-table', 10);
```

### S3 Signed URLs

```javascript
import * as s3Service from './services/s3-service.js';

// Generate signed URL for download (valid for 1 hour)
const downloadUrl = await s3Service.getDownloadSignedUrl('my-bucket', 'file.pdf', 3600);

// Generate signed URL for direct upload
const uploadUrl = await s3Service.getUploadSignedUrl('my-bucket', 'new-file.pdf', 'application/pdf', 1800);

// Generate multiple signed URLs
const urls = await s3Service.getMultipleDownloadSignedUrls('my-bucket', ['file1.txt', 'file2.jpg'], 3600);

// Use upload URL from frontend
fetch(uploadUrl, {
  method: 'PUT',
  body: fileFile,
  headers: {
    'Content-Type': 'application/pdf'
  }
}).then(response => {
  if (response.ok) {
    console.log('File uploaded successfully');
  }
});
```

## 🛡️ Error Handling

The project includes utilities for robust error handling:

```javascript
import { withRetry, extractErrorInfo } from './utils/error-handler.js';

try {
  // Operation with automatic retry
  const result = await withRetry(async () => {
    return await someAwsOperation();
  }, 3, 1000); // 3 retries, 1s initial delay

} catch (error) {
  const errorInfo = extractErrorInfo(error);
  console.error('AWS Error:', errorInfo);
}
```

## 🔧 Advanced Configuration

### Timeouts and Retries

You can configure timeouts and retries in clients:

```javascript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 3,
  requestTimeout: 3000,
});
```

### DynamoDB Configuration

For DynamoDB Document Client:

```javascript
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});
```

## 🧪 Testing

The project includes basic tests using Node.js native Test Runner:

```bash
# Run all tests
npm test

# Run specific test
node --test src/tests/config.test.js
```

## 📦 Available Scripts

- `npm start` - Run the application
- `npm run dev` - Development mode with watch
- `npm test` - Run tests
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## 🔒 Best Practices

1. **Never hardcode credentials** in code
2. **Use environment variables** for configuration
3. **Implement robust error handling**
4. **Reuse AWS clients** instead of creating new ones for each operation
5. **Configure appropriate timeouts**
6. **Use retry logic** for critical operations
7. **Validate configuration** at application startup

## 🆔 Required IAM Permissions

For the examples to work, your AWS user/role needs these minimum permissions:

### For S3:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "*"
    }
  ]
}
```

### For DynamoDB:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/your-table-name"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-functionality`)
3. Commit your changes (`git commit -am 'Add new functionality'`)
4. Push to the branch (`git push origin feature/new-functionality`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🔗 Useful Links

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
