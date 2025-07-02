/**
 * Utilidades comunes para manejo de errores AWS
 */

/**
 * Extraer información útil de errores del AWS SDK
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
 * Verificar si un error es de tipo específico
 */
export function isAwsError(error, errorCode) {
  return error.name === errorCode;
}

/**
 * Wrapper para retry automático
 */
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // No reintentar si el error no es retryable
      if (!error.$retryable && attempt < maxRetries) {
        break;
      }

      if (attempt < maxRetries) {
        console.warn(`Intento ${attempt} falló, reintentando en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }
  }

  throw lastError;
}
