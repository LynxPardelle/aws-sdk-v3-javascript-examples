import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  extractErrorInfo,
  isAwsError,
  withRetry,
} from '../utils/error-handler.js';

describe('Error Handler Utils', () => {
  test('should extract error info', () => {
    const mockError = {
      name: 'TestError',
      message: 'Test message',
      $metadata: {
        httpStatusCode: 404,
        requestId: 'test-request-id',
      },
      $retryable: true,
    };

    const errorInfo = extractErrorInfo(mockError);

    assert.strictEqual(errorInfo.name, 'TestError');
    assert.strictEqual(errorInfo.code, 404);
    assert.strictEqual(errorInfo.requestId, 'test-request-id');
    assert.strictEqual(errorInfo.message, 'Test message');
    assert.strictEqual(errorInfo.retryable, true);
  });

  test('should identify AWS error types', () => {
    const error = { name: 'NoSuchBucket' };
    assert.ok(isAwsError(error, 'NoSuchBucket'));
    assert.ok(!isAwsError(error, 'AccessDenied'));
  });

  test('should retry operation on failure', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      if (attempts < 3) {
        const error = new Error('Test error');
        error.$retryable = true;
        throw error;
      }
      return 'success';
    };

    const result = await withRetry(operation, 3, 10);
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 3);
  });
});
