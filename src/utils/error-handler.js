/**
 * Common AWS error handling utilities
 */

/**
 * Extract useful information from AWS SDK errors
 */
export function extractErrorInfo(error) {
  return {
    name: error.name,
    code: error.$metadata?.httpStatusCode,
    requestId: error.$metadata?.requestId,
    message: error.message,
    retryable: error.$retryable,
  };
}

/**
 * Check if an error is of a specific type
 */
export function isAwsError(error, errorCode) {
  return error.name === errorCode;
}

/**
 * Wrapper for automatic retry
 */
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if the error is not retryable
      if (!error.$retryable && attempt < maxRetries) {
        break;
      }

      if (attempt < maxRetries) {
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}
