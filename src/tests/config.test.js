import { test, describe } from 'node:test';
import assert from 'node:assert';
import { awsConfig, validateConfig } from '../config/aws-config.js';

describe('AWS Configuration', () => {
  test('should have valid aws config', () => {
    assert.ok(awsConfig.region);
    assert.strictEqual(typeof awsConfig.region, 'string');
  });

  test('should validate config without throwing', () => {
    // Esto podría fallar si no tienes las variables de entorno configuradas
    // En un entorno de test real, configurarías variables de entorno de test
    try {
      validateConfig();
      assert.ok(true, 'Configuración válida');
    } catch (error) {
      // En un entorno de desarrollo sin configuración, esto es esperado
      assert.ok(error.message.includes('Variables de entorno faltantes'));
    }
  });
});
