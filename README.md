# AWS SDK v3 JavaScript Examples

Un proyecto mínimo con buenas prácticas para usar el AWS SDK v3 con Node.js.

## 🚀 Características

- ✅ **Configuración modular** con variables de entorno
- ✅ **Clientes reutilizables** para S3 y DynamoDB
- ✅ **Manejo de errores** robusto con retry automático
- ✅ **Estructura organizada** por servicios
- ✅ **ESLint y Prettier** configurados
- ✅ **Tests básicos** incluidos
- ✅ **ESM (ES Modules)** soporte nativo

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── aws-config.js       # Configuración centralizada de AWS
├── clients/
│   ├── s3-client.js        # Cliente S3 configurado
│   └── dynamodb-client.js  # Cliente DynamoDB configurado
├── services/
│   ├── s3-service.js       # Operaciones S3
│   └── dynamodb-service.js # Operaciones DynamoDB
├── utils/
│   └── error-handler.js    # Utilidades para manejo de errores
├── tests/
│   ├── config.test.js      # Tests de configuración
│   └── error-handler.test.js # Tests de error handler
└── index.js                # Punto de entrada principal
```

## 🛠️ Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <tu-repo-url>
   cd aws-sdk-v3-javascript-examples
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales AWS:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=tu-access-key-id
   AWS_SECRET_ACCESS_KEY=tu-secret-access-key
   
   # Opcional: para ejemplos específicos
   S3_BUCKET_NAME=tu-bucket-name
   DYNAMODB_TABLE_NAME=tu-tabla-nombre
   ```

## 🔐 Configuración de AWS

### Opción 1: Variables de Entorno
Configura las variables en tu archivo `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu-access-key-id
AWS_SECRET_ACCESS_KEY=tu-secret-access-key
```

### Opción 2: AWS Profile
Si tienes perfiles configurados con AWS CLI:
```env
AWS_PROFILE=tu-perfil
AWS_REGION=us-east-1
```

### Opción 3: IAM Roles (Recomendado para producción)
Para aplicaciones ejecutándose en EC2, Lambda, etc., el SDK automáticamente usará los roles IAM asociados.

## 🏃‍♂️ Uso

### Ejecutar la aplicación:
```bash
npm start
```

### Modo desarrollo (con watch):
```bash
npm run dev
```

### Ejecutar tests:
```bash
npm test
```

### Linting y formateo:
```bash
npm run lint          # Verificar código
npm run lint:fix      # Corregir problemas automáticamente
npm run format        # Formatear código con Prettier
```

## 📝 Ejemplos de Uso

### S3 Operations

```javascript
import * as s3Service from './services/s3-service.js';

// Listar buckets
const buckets = await s3Service.listBuckets();

// Subir archivo
await s3Service.uploadObject('mi-bucket', 'archivo.txt', 'contenido');

// Descargar archivo
const file = await s3Service.downloadObject('mi-bucket', 'archivo.txt');

// Eliminar archivo
await s3Service.deleteObject('mi-bucket', 'archivo.txt');
```

### DynamoDB Operations

```javascript
import * as dynamoService from './services/dynamodb-service.js';

// Crear/actualizar item
await dynamoService.putItem('mi-tabla', {
  id: '123',
  name: 'Juan',
  email: 'juan@ejemplo.com'
});

// Obtener item
const item = await dynamoService.getItem('mi-tabla', { id: '123' });

// Eliminar item
await dynamoService.deleteItem('mi-tabla', { id: '123' });

// Escanear tabla
const result = await dynamoService.scanTable('mi-tabla', 10);
```

### URLs Firmadas de S3

```javascript
import * as s3Service from './services/s3-service.js';

// Generar URL firmada para descarga (válida por 1 hora)
const downloadUrl = await s3Service.getDownloadSignedUrl('mi-bucket', 'archivo.pdf', 3600);

// Generar URL firmada para upload directo
const uploadUrl = await s3Service.getUploadSignedUrl('mi-bucket', 'nuevo-archivo.pdf', 'application/pdf', 1800);

// Generar múltiples URLs firmadas
const urls = await s3Service.getMultipleDownloadSignedUrls('mi-bucket', ['file1.txt', 'file2.jpg'], 3600);

// Usar URL de upload desde frontend
fetch(uploadUrl, {
  method: 'PUT',
  body: archivoFile,
  headers: {
    'Content-Type': 'application/pdf'
  }
}).then(response => {
  if (response.ok) {
    console.log('Archivo subido exitosamente');
  }
});
```

## 🛡️ Manejo de Errores

El proyecto incluye utilidades para manejo robusto de errores:

```javascript
import { withRetry, extractErrorInfo } from './utils/error-handler.js';

try {
  // Operación con retry automático
  const result = await withRetry(async () => {
    return await someAwsOperation();
  }, 3, 1000); // 3 reintentos, 1s de delay inicial

} catch (error) {
  const errorInfo = extractErrorInfo(error);
  console.error('Error AWS:', errorInfo);
}
```

## 🔧 Configuración Avanzada

### Timeouts y Reintentos

Puedes configurar timeouts y reintentos en los clientes:

```javascript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  maxAttempts: 3,
  requestTimeout: 3000,
});
```

### Configuración de DynamoDB

Para DynamoDB Document Client:

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

El proyecto incluye tests básicos usando Node.js Test Runner nativo:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar test específico
node --test src/tests/config.test.js
```

## 📦 Scripts Disponibles

- `npm start` - Ejecutar la aplicación
- `npm run dev` - Modo desarrollo con watch
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir problemas de ESLint
- `npm run format` - Formatear código con Prettier

## 🔒 Mejores Prácticas

1. **Nunca hardcodees credenciales** en el código
2. **Usa variables de entorno** para configuración
3. **Implementa manejo de errores** robusto
4. **Reutiliza clientes** AWS en lugar de crear nuevos para cada operación
5. **Configura timeouts** apropiados
6. **Usa retry logic** para operaciones críticas
7. **Valida configuración** al inicio de la aplicación

## 🆔 Permisos IAM Requeridos

Para que los ejemplos funcionen, tu usuario/rol AWS necesita estos permisos mínimos:

### Para S3:
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

### Para DynamoDB:
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
      "Resource": "arn:aws:dynamodb:*:*:table/tu-tabla-nombre"
    }
  ]
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces Útiles

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
