import { validateConfig } from './config/aws-config.js';
import * as s3Service from './services/s3-service.js';
import * as dynamoService from './services/dynamodb-service.js';
import { extractErrorInfo, withRetry } from './utils/error-handler.js';

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

    if(process.env.S3_BUCKET_NAME) {
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
  } catch (error) {
    console.error('Error en demostración S3:', extractErrorInfo(error));
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
