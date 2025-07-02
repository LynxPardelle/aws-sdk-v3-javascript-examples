/**
 * Ejemplos avanzados de URLs firmadas con S3
 * Casos de uso reales y patrones comunes
 */

import * as s3Service from '../services/s3-service.js';
import { extractErrorInfo } from '../utils/error-handler.js';

/**
 * Ejemplo 1: Sistema de descarga temporal para usuarios
 * Útil para permitir que usuarios descarguen archivos por tiempo limitado
 */
export async function createTemporaryDownloadLink(
  bucketName,
  fileKey,
  userEmail,
  durationMinutes = 30
) {
  try {
    const expiresIn = durationMinutes * 60; // Convertir a segundos
    const downloadUrl = await s3Service.getDownloadSignedUrl(
      bucketName,
      fileKey,
      expiresIn
    );

    // Aquí podrías guardar el enlace en tu base de datos con información del usuario
    const linkInfo = {
      user: userEmail,
      fileKey,
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      createdAt: new Date(),
    };

    console.log(`✅ Enlace temporal creado para ${userEmail}:`);
    console.log(`📁 Archivo: ${fileKey}`);
    console.log(`⏰ Expira en: ${durationMinutes} minutos`);
    console.log(`🔗 URL: ${downloadUrl}`);

    return linkInfo;
  } catch (error) {
    console.error('Error creando enlace temporal:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Ejemplo 2: Upload directo desde frontend con validaciones
 * Útil para formularios de upload sin pasar por tu servidor
 */
export async function createUploadLinkWithValidation(
  bucketName,
  fileName,
  fileType,
  maxSizeBytes = 5 * 1024 * 1024
) {
  try {
    const fileKey = `uploads/${Date.now()}-${fileName}`;
    const expiresIn = 300; // 5 minutos para upload

    // Generar URL con restricciones
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

    console.log(`✅ URL de upload generada:`);
    console.log(`📁 Archivo: ${fileName} -> ${fileKey}`);
    console.log(
      `📏 Tamaño máximo: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    );
    console.log(`⏰ Válida por: ${expiresIn / 60} minutos`);

    return uploadInfo;
  } catch (error) {
    console.error('Error creando URL de upload:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Ejemplo 3: Galería de imágenes con URLs firmadas
 * Útil para mostrar imágenes privadas en una galería web
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

      // URLs para miniaturas (duración corta)
      const thumbnailUrl = await s3Service.getDownloadSignedUrl(
        bucketName,
        thumbnailKey,
        thumbnailDuration
      );

      // URLs para imágenes completas (duración más larga)
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

    console.log(`✅ Galería de ${imageKeys.length} imágenes generada`);
    console.log(`🖼️ Miniaturas válidas por: ${thumbnailDuration / 60} minutos`);
    console.log(
      `📸 Imágenes completas válidas por: ${fullSizeDuration / 60} minutos`
    );

    return gallery;
  } catch (error) {
    console.error('Error creando galería:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Ejemplo 4: Sistema de descarga masiva con compresión
 * Útil para permitir descarga de múltiples archivos
 */
export async function createBulkDownloadUrls(
  bucketName,
  fileKeys,
  groupName = 'download',
  durationHours = 2
) {
  try {
    const expiresIn = durationHours * 3600; // Convertir a segundos
    const bulkDownload = {
      groupName,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      files: {},
      summary: {
        totalFiles: fileKeys.length,
        estimatedSize: 'Calculando...',
      },
    };

    // Generar URLs en paralelo para mejor rendimiento
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
        fileName: fileKey.split('/').pop(), // Extraer nombre del archivo
      };
    });

    console.log(`✅ Descarga masiva preparada: ${groupName}`);
    console.log(`📦 ${fileKeys.length} archivos incluidos`);
    console.log(`⏰ URLs válidas por: ${durationHours} horas`);

    return bulkDownload;
  } catch (error) {
    console.error('Error creando descarga masiva:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Ejemplo 5: Integración con API externa
 * Útil para compartir archivos con servicios de terceros
 */
export async function createAPIIntegrationUrl(
  bucketName,
  fileKey,
  apiName,
  webhookUrl = null
) {
  try {
    const expiresIn = 1800; // 30 minutos para APIs
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

    console.log(`✅ URL de integración generada para: ${apiName}`);
    console.log(`📁 Archivo: ${fileKey}`);
    console.log(`⏰ Válida por: 30 minutos`);

    if (webhookUrl) {
      console.log(`🔔 Webhook configurado: ${webhookUrl}`);
    }

    return integration;
  } catch (error) {
    console.error('Error creando URL de integración:', extractErrorInfo(error));
    throw error;
  }
}

/**
 * Función de demostración que ejecuta todos los ejemplos
 */
export async function demonstrateAdvancedSignedUrls() {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    console.log('⚠️ S3_BUCKET_NAME no configurado para ejemplos avanzados');
    return;
  }

  console.log('\n🚀 Demostrando casos de uso avanzados de URLs firmadas:\n');

  try {
    // Subir archivos de ejemplo
    await s3Service.uploadObject(
      bucketName,
      'documents/report.pdf',
      'Contenido del reporte',
      'application/pdf'
    );
    await s3Service.uploadObject(
      bucketName,
      'images/photo1.jpg',
      'Datos de imagen 1',
      'image/jpeg'
    );
    await s3Service.uploadObject(
      bucketName,
      'images/photo2.jpg',
      'Datos de imagen 2',
      'image/jpeg'
    );

    // Ejemplo 1: Enlace temporal
    console.log('1️⃣ Enlace temporal para usuario:');
    await createTemporaryDownloadLink(
      bucketName,
      'documents/report.pdf',
      'usuario@ejemplo.com',
      15
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Ejemplo 2: Upload directo
    console.log('2️⃣ URL de upload directo:');
    await createUploadLinkWithValidation(
      bucketName,
      'nuevo-documento.pdf',
      'application/pdf',
      2 * 1024 * 1024
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Ejemplo 3: Galería de imágenes
    console.log('3️⃣ Galería de imágenes:');
    await createImageGalleryUrls(
      bucketName,
      ['photo1.jpg', 'photo2.jpg'],
      120,
      600
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Ejemplo 4: Descarga masiva
    console.log('4️⃣ Descarga masiva:');
    await createBulkDownloadUrls(
      bucketName,
      ['documents/report.pdf', 'images/photo1.jpg', 'images/photo2.jpg'],
      'MyFiles',
      1
    );

    console.log('\n' + '─'.repeat(50) + '\n');

    // Ejemplo 5: Integración API
    console.log('5️⃣ Integración con API externa:');
    await createAPIIntegrationUrl(
      bucketName,
      'documents/report.pdf',
      'ProcessingAPI',
      'https://api.ejemplo.com/webhook'
    );

    // Limpiar archivos de ejemplo
    console.log('\n🧹 Limpiando archivos de ejemplo...');
    await s3Service.deleteObject(bucketName, 'documents/report.pdf');
    await s3Service.deleteObject(bucketName, 'images/photo1.jpg');
    await s3Service.deleteObject(bucketName, 'images/photo2.jpg');
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('Error en ejemplos avanzados:', extractErrorInfo(error));
  }
}
