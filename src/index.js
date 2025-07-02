import { validateConfig } from './config/aws-config.js';
import * as s3Service from './services/s3-service.js';
import * as dynamoService from './services/dynamodb-service.js';
import { extractErrorInfo, withRetry } from './utils/error-handler.js';
import { demonstrateAdvancedSignedUrls } from './examples/signed-urls-advanced.js';

/**
 * Función principal de demostración
 */
async function main() {
  try {
    // Validar configuración
    validateConfig();
    console.log('✅ Configuración AWS validada');

    // Ejemplo de S3
    console.log('\n📦 Ejemplos de S3:');
    await demonstrateS3();

    // Ejemplo de DynamoDB
    console.log('\n🗄️ Ejemplos de DynamoDB:');
    await demonstrateDynamoDB();

    // Ejemplos avanzados de URLs firmadas
    console.log('\n🎯 Ejemplos avanzados de URLs firmadas:');
    await demonstrateAdvancedSignedUrls();
  } catch (error) {
    console.error('❌ Error en la aplicación:', extractErrorInfo(error));
    process.exit(1);
  }
}

/**
 * Demostración de operaciones S3
 */
async function demonstrateS3() {
  try {
    // Listar buckets
    const buckets = await withRetry(() => s3Service.listBuckets());
    console.log('Buckets disponibles:', buckets?.length || 0);

    if (buckets && buckets.length > 0) {
      buckets.forEach((bucket) => {
        console.log(`  - ${bucket.Name} (creado: ${bucket.CreationDate})`);
      });
    }

    if (process.env.S3_BUCKET_NAME) {
      const bucketName = process.env.S3_BUCKET_NAME;
      if (bucketName) {
        const testKey = 'test-file.txt';
        const testContent = 'Hola desde AWS SDK v3!';

        console.log(`\nSubiendo archivo a ${bucketName}/${testKey}...`);
        await s3Service.uploadObject(bucketName, testKey, testContent);
        console.log('✅ Archivo subido exitosamente');

        console.log('Descargando archivo...');
        const downloaded = await s3Service.downloadObject(bucketName, testKey);
        console.log('Contenido descargado:', downloaded.content);
        console.log('Metadatos:', downloaded.metadata);
        console.log('Tipo de contenido:', downloaded.contentType);

        console.log(`\nBorrando archivo ${bucketName}/${testKey}...`);
        await s3Service.deleteObject(bucketName, testKey);
        console.log('✅ Archivo borrado exitosamente');
      }
    }

    // Ejemplos de URLs firmadas
    console.log('\n🔗 Ejemplos de URLs firmadas:');
    await demonstrateSignedUrls();
  } catch (error) {
    console.error('Error en demostración S3:', extractErrorInfo(error));
  }
}

/**
 * Demostración de URLs firmadas de S3
 */
async function demonstrateSignedUrls() {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.log(
        '⚠️ S3_BUCKET_NAME no configurado, saltando ejemplos de URLs firmadas'
      );
      return;
    }

    const testKey = 'signed-url-example.txt';
    const testContent = 'Este archivo fue creado para demostrar URLs firmadas';

    // 1. Subir un archivo para poder generar URLs de descarga
    console.log(
      `Subiendo archivo ${testKey} para ejemplos de URLs firmadas...`
    );
    await s3Service.uploadObject(bucketName, testKey, testContent);

    // 2. Generar URL firmada para descarga (válida por 1 hora)
    console.log('\n🔽 Generando URL firmada para descarga (1 hora):');
    const downloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      testKey,
      3600
    );
    console.log('URL de descarga:', downloadUrl);
    console.log('⏰ Esta URL expira en 1 hora');

    // 3. Generar URL firmada para descarga (válida por 5 minutos)
    console.log('\n🔽 Generando URL firmada para descarga (5 minutos):');
    const shortDownloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      testKey,
      300
    );
    console.log('URL de descarga (corta duración):', shortDownloadUrl);
    console.log('⏰ Esta URL expira en 5 minutos');

    // 4. Generar URL firmada para upload
    console.log('\n🔼 Generando URL firmada para upload:');
    const uploadKey = 'uploaded-via-signed-url.txt';
    const uploadUrl = await s3Service.getUploadSignedUrl(
      bucketName,
      uploadKey,
      'text/plain',
      3600
    );
    console.log('URL de upload:', uploadUrl);
    console.log(
      '📝 Puedes usar esta URL para subir archivos directamente desde el frontend'
    );
    console.log('📋 Ejemplo de uso con fetch:');
    console.log(`
      fetch('${uploadUrl}', {
        method: 'PUT',
        body: 'Contenido del archivo',
        headers: {
          'Content-Type': 'text/plain'
        }
      }).then(response => {
        if (response.ok) {
          console.log('Archivo subido exitosamente');
        }
      });
    `);

    // 5. Generar múltiples URLs firmadas
    console.log('\n📦 Generando múltiples URLs firmadas:');
    const keys = [testKey, 'otro-archivo.txt', 'imagen.jpg'];

    // Primero subimos algunos archivos adicionales para el ejemplo
    await s3Service.uploadObject(
      bucketName,
      'otro-archivo.txt',
      'Contenido del otro archivo'
    );
    await s3Service.uploadObject(
      bucketName,
      'imagen.jpg',
      'Datos simulados de imagen',
      'image/jpeg'
    );

    const multipleUrls = await s3Service.getMultipleDownloadSignedUrls(
      bucketName,
      keys,
      1800
    ); // 30 minutos
    console.log('URLs múltiples generadas:');
    Object.entries(multipleUrls).forEach(([key, url]) => {
      console.log(`  📄 ${key}: ${url}`);
    });

    // 6. Limpiar archivos de ejemplo
    console.log('\n🧹 Limpiando archivos de ejemplo...');
    await s3Service.deleteObject(bucketName, testKey);
    await s3Service.deleteObject(bucketName, 'otro-archivo.txt');
    await s3Service.deleteObject(bucketName, 'imagen.jpg');
    console.log('✅ Archivos de ejemplo eliminados');

    console.log('\n💡 Casos de uso comunes para URLs firmadas:');
    console.log('  • Permitir descarga temporal de archivos privados');
    console.log(
      '  • Upload directo desde frontend sin exponer credenciales AWS'
    );
    console.log(
      '  • Compartir archivos con usuarios externos por tiempo limitado'
    );
    console.log('  • Integración con aplicaciones de terceros');
    console.log('  • Control granular de acceso temporal a recursos');
  } catch (error) {
    console.error(
      'Error en demostración de URLs firmadas:',
      extractErrorInfo(error)
    );
  }
}

/**
 * Demostración de operaciones DynamoDB
 */
// eslint-disable-next-line no-unused-vars
async function demonstrateDynamoDB() {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
      console.log(
        '⚠️ DYNAMODB_TABLE_NAME no configurado, saltando ejemplos DynamoDB'
      );
      return;
    }

    // Ejemplo de crear un item
    const testItem = {
      id: 'test-id-' + Date.now(),
      name: 'Ejemplo desde AWS SDK v3',
      timestamp: new Date().toISOString(),
    };

    console.log('Guardando item en DynamoDB...');
    await dynamoService.putItem(tableName, testItem);
    console.log('✅ Item guardado:', testItem.id);

    // Ejemplo de obtener el item
    console.log('Obteniendo item...');
    const retrievedItem = await dynamoService.getItem(tableName, {
      id: testItem.id,
    });
    console.log('Item obtenido:', retrievedItem);

    // Ejemplo de escanear tabla
    console.log('Escaneando tabla...');
    const scanResult = await dynamoService.scanTable(tableName, 5);
    console.log(`Encontrados ${scanResult.count} items`);

    // Ejemplo de eliminar el item
    console.log('Eliminando item...');
    await dynamoService.deleteItem(tableName, { id: testItem.id });
    console.log('✅ Item eliminado:', testItem.id);

    // Verificar que el item fue eliminado
    const deletedItem = await dynamoService.getItem(tableName, {
      id: testItem.id,
    });
    if (!deletedItem) {
      console.log('✅ Item eliminado correctamente, no encontrado en la tabla');
    } else {
      console.error('⚠️ El item aún existe en la tabla:', deletedItem);
    }
  } catch (error) {
    console.error('Error en demostración DynamoDB:', extractErrorInfo(error));
  }
}

// Ejecutar la aplicación
main();
