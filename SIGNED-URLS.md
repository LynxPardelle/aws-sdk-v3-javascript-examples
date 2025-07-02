# URLs Firmadas de S3 - Guía Completa

Las URLs firmadas permiten acceso temporal a objetos privados en S3 sin exponer credenciales AWS.

## 🎯 ¿Qué son las URLs Firmadas?

Las URLs firmadas son URLs especiales que incluyen información de autenticación y tienen un tiempo de expiración limitado. Permiten que usuarios sin credenciales AWS accedan a recursos de S3 de forma temporal y segura.

## 🔧 Configuración Básica

```javascript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../clients/s3-client.js';
```

## 📥 URLs para Descarga

### Descarga Simple
```javascript
import * as s3Service from './services/s3-service.js';

// URL válida por 1 hora (3600 segundos)
const downloadUrl = await s3Service.getDownloadSignedUrl(
  'mi-bucket', 
  'documentos/archivo.pdf', 
  3600
);

console.log('URL de descarga:', downloadUrl);
// Output: https://mi-bucket.s3.amazonaws.com/documentos/archivo.pdf?X-Amz-Algorithm=...
```

### Descarga con Diferentes Duraciones
```javascript
// URL corta (5 minutos)
const shortUrl = await s3Service.getDownloadSignedUrl('bucket', 'file.txt', 300);

// URL larga (24 horas)
const longUrl = await s3Service.getDownloadSignedUrl('bucket', 'file.txt', 86400);
```

### Múltiples URLs de Descarga
```javascript
const fileKeys = ['doc1.pdf', 'image1.jpg', 'video1.mp4'];
const urls = await s3Service.getMultipleDownloadSignedUrls('mi-bucket', fileKeys, 3600);

// Resultado:
// {
//   'doc1.pdf': 'https://...',
//   'image1.jpg': 'https://...',
//   'video1.mp4': 'https://...'
// }
```

## 📤 URLs para Upload

### Upload Directo desde Frontend
```javascript
// Generar URL de upload
const uploadUrl = await s3Service.getUploadSignedUrl(
  'mi-bucket',
  'uploads/nuevo-archivo.pdf',
  'application/pdf',
  1800 // 30 minutos
);

// Usar en el frontend
fetch(uploadUrl, {
  method: 'PUT',
  body: archivoFile,
  headers: {
    'Content-Type': 'application/pdf'
  }
}).then(response => {
  if (response.ok) {
    console.log('✅ Archivo subido exitosamente');
  } else {
    console.error('❌ Error en upload');
  }
});
```

### Upload con Validaciones
```html
<!-- Frontend HTML -->
<input type="file" id="fileInput" accept=".pdf,.jpg,.png">
<button onclick="uploadFile()">Subir Archivo</button>

<script>
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Selecciona un archivo');
    return;
  }
  
  // Solicitar URL firmada al backend
  const response = await fetch('/api/get-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  });
  
  const { uploadUrl } = await response.json();
  
  // Upload directo a S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });
  
  if (uploadResponse.ok) {
    alert('✅ Archivo subido correctamente');
  }
}
</script>
```

## 🎯 Casos de Uso Reales

### 1. Sistema de Descarga Temporal para Usuarios
```javascript
// Backend: Generar enlace temporal para un usuario
async function createUserDownloadLink(userId, fileId, durationMinutes = 30) {
  const userFile = await getUserFile(userId, fileId);
  
  if (!userFile) {
    throw new Error('Archivo no encontrado');
  }
  
  const downloadUrl = await s3Service.getDownloadSignedUrl(
    userFile.bucket,
    userFile.key,
    durationMinutes * 60
  );
  
  // Opcional: Guardar en base de datos para auditoría
  await logDownloadRequest(userId, fileId, downloadUrl);
  
  return {
    downloadUrl,
    expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
    fileName: userFile.name
  };
}
```

### 2. Galería de Imágenes Privadas
```javascript
async function createImageGallery(albumId, userId) {
  const album = await getAlbum(albumId, userId);
  const imageKeys = album.images.map(img => img.s3Key);
  
  // URLs para miniaturas (duración corta)
  const thumbnailUrls = await s3Service.getMultipleDownloadSignedUrls(
    'thumbnails-bucket',
    imageKeys.map(key => `thumbs/${key}`),
    300 // 5 minutos
  );
  
  // URLs para imágenes completas (duración más larga)
  const fullSizeUrls = await s3Service.getMultipleDownloadSignedUrls(
    'images-bucket',
    imageKeys,
    1800 // 30 minutos
  );
  
  return {
    albumId,
    thumbnails: thumbnailUrls,
    fullSize: fullSizeUrls,
    generatedAt: new Date()
  };
}
```

### 3. Integración con APIs Externas
```javascript
async function shareWithExternalAPI(fileId, apiEndpoint) {
  const file = await getFile(fileId);
  
  // URL válida por tiempo limitado para la API externa
  const shareUrl = await s3Service.getDownloadSignedUrl(
    file.bucket,
    file.key,
    1800 // 30 minutos
  );
  
  // Enviar a API externa
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileUrl: shareUrl,
      fileName: file.name,
      fileType: file.contentType,
      expiresAt: new Date(Date.now() + 1800 * 1000)
    })
  });
  
  return response.json();
}
```

## ⚡ Optimizaciones de Rendimiento

### Generación en Paralelo
```javascript
async function generateMultipleUrls(files) {
  // ❌ Forma lenta (secuencial)
  const urlsSlow = {};
  for (const file of files) {
    urlsSlow[file.key] = await s3Service.getDownloadSignedUrl(
      file.bucket, 
      file.key, 
      3600
    );
  }
  
  // ✅ Forma rápida (paralelo)
  const urlPromises = files.map(file => 
    s3Service.getDownloadSignedUrl(file.bucket, file.key, 3600)
      .then(url => ({ key: file.key, url }))
  );
  
  const results = await Promise.all(urlPromises);
  const urlsFast = {};
  results.forEach(({ key, url }) => {
    urlsFast[key] = url;
  });
  
  return urlsFast;
}
```

### Cache de URLs
```javascript
// Cache simple en memoria (para desarrollo)
const urlCache = new Map();

async function getCachedSignedUrl(bucket, key, expiresIn) {
  const cacheKey = `${bucket}:${key}:${expiresIn}`;
  
  if (urlCache.has(cacheKey)) {
    const cached = urlCache.get(cacheKey);
    
    // Verificar si no ha expirado (con margen de seguridad)
    if (cached.expiresAt > Date.now() + 60000) { // 1 minuto de margen
      return cached.url;
    }
  }
  
  // Generar nueva URL
  const url = await s3Service.getDownloadSignedUrl(bucket, key, expiresIn);
  
  // Guardar en cache
  urlCache.set(cacheKey, {
    url,
    expiresAt: Date.now() + (expiresIn * 1000)
  });
  
  return url;
}
```

## 🔒 Mejores Prácticas de Seguridad

### 1. Tiempos de Expiración Apropiados
```javascript
const EXPIRATION_TIMES = {
  QUICK_VIEW: 300,      // 5 minutos - Vista rápida
  STANDARD: 3600,       // 1 hora - Descarga normal
  LONG_TERM: 86400,     // 24 horas - Descarga de archivos grandes
  UPLOAD: 1800,         // 30 minutos - Upload de archivos
  API_INTEGRATION: 900  // 15 minutos - Integración con APIs
};

// Usar según el caso de uso
const downloadUrl = await s3Service.getDownloadSignedUrl(
  bucket, 
  key, 
  EXPIRATION_TIMES.STANDARD
);
```

### 2. Validación de Archivos en Upload
```javascript
async function createSecureUploadUrl(fileName, fileType, maxSizeBytes) {
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(fileType)) {
    throw new Error('Tipo de archivo no permitido');
  }
  
  // Validar tamaño
  if (maxSizeBytes > 10 * 1024 * 1024) { // 10MB
    throw new Error('Archivo demasiado grande');
  }
  
  // Generar nombre único
  const uniqueKey = `uploads/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
  
  return await s3Service.getUploadSignedUrl(
    'secure-uploads-bucket',
    uniqueKey,
    fileType,
    1800
  );
}
```

### 3. Logging y Auditoría
```javascript
async function auditableDownloadUrl(userId, fileId, reason) {
  const downloadUrl = await s3Service.getDownloadSignedUrl(
    bucket, 
    key, 
    3600
  );
  
  // Log de auditoría
  await logDownloadAccess({
    userId,
    fileId,
    action: 'SIGNED_URL_GENERATED',
    reason,
    expiresAt: new Date(Date.now() + 3600 * 1000),
    ipAddress: request.ip,
    userAgent: request.headers['user-agent']
  });
  
  return downloadUrl;
}
```

## ⚠️ Limitaciones y Consideraciones

### Limitaciones de AWS
- **Tiempo máximo de expiración**: 7 días (604,800 segundos)
- **Tiempo mínimo**: 1 segundo (aunque se recomienda al menos 60 segundos)
- **Tamaño de URL**: Las URLs pueden ser muy largas (>500 caracteres)

### Consideraciones de Rendimiento
- Generar URLs firmadas es una operación rápida (no requiere llamada a AWS)
- El proceso es completamente local una vez que tienes las credenciales
- Sin embargo, validar credenciales puede añadir latencia en el primer uso

### Consideraciones de Seguridad
- Las URLs contienen tokens de acceso temporal
- No deben almacenarse permanentemente en logs públicos
- Revocar una URL firmada no es posible - esperar a que expire
- Considerar usar tiempos de expiración cortos para datos sensibles

## 🧪 Testing

```javascript
// Test de URLs firmadas
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Signed URLs', () => {
  test('should generate valid URL format', async () => {
    const url = await s3Service.getDownloadSignedUrl('test-bucket', 'test.txt', 3600);
    
    assert.ok(url.startsWith('https://'));
    assert.ok(url.includes('test-bucket'));
    assert.ok(url.includes('test.txt'));
    assert.ok(url.includes('X-Amz-Signature'));
  });
  
  test('should respect expiration time', async () => {
    const shortUrl = await s3Service.getDownloadSignedUrl('bucket', 'file.txt', 60);
    const longUrl = await s3Service.getDownloadSignedUrl('bucket', 'file.txt', 3600);
    
    // URLs deben ser diferentes debido a diferentes tiempos de expiración
    assert.notStrictEqual(shortUrl, longUrl);
  });
});
```

## 📚 Recursos Adicionales

- [AWS S3 Presigned URLs Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/presigned-urls.html)
- [AWS SDK v3 S3 Request Presigner](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_request_presigner.html)
- [Best Practices for S3 Security](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
