# Configuración de Credenciales AWS - Guía Paso a Paso

Esta guía te ayuda a configurar credenciales AWS reales para que el proyecto funcione con recursos AWS.

## 🔑 Métodos de Configuración

### Opción 1: Variables de Entorno (Recomendado para desarrollo)

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env` con tus credenciales:**
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   
   # Recursos específicos (crear en AWS Console)
   S3_BUCKET_NAME=mi-bucket-unico-123
   DYNAMODB_TABLE_NAME=mi-tabla-ejemplo
   ```

### Opción 2: AWS CLI Profiles

1. **Instala AWS CLI:**
   ```bash
   # Windows
   winget install Amazon.AWSCLI
   
   # macOS
   brew install awscli
   
   # Linux
   sudo apt install awscli
   ```

2. **Configura un perfil:**
   ```bash
   aws configure --profile mi-perfil
   ```

3. **Usa el perfil en tu `.env`:**
   ```env
   AWS_PROFILE=mi-perfil
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=mi-bucket-unico-123
   DYNAMODB_TABLE_NAME=mi-tabla-ejemplo
   ```

### Opción 3: AWS SSO (Recomendado para empresas)

1. **Configura SSO:**
   ```bash
   aws configure sso --profile mi-empresa
   ```

2. **Inicia sesión:**
   ```bash
   aws sso login --profile mi-empresa
   ```

3. **Configura el perfil en `.env`:**
   ```env
   AWS_PROFILE=mi-empresa
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=mi-bucket-empresa
   DYNAMODB_TABLE_NAME=mi-tabla-empresa
   ```

## 🏗️ Crear Recursos AWS

### Crear Bucket S3

1. **Via AWS Console:**
   - Ir a S3 en AWS Console
   - Clic en "Create bucket"
   - Nombre único: `mi-bucket-unico-123`
   - Región: `us-east-1`
   - Configuraciones por defecto

2. **Via AWS CLI:**
   ```bash
   aws s3 mb s3://mi-bucket-unico-123 --region us-east-1
   ```

3. **Via AWS SDK (en código):**
   ```javascript
   // Descomenta esta línea en src/index.js para crear el bucket automáticamente
   // await s3Service.createBucket(process.env.S3_BUCKET_NAME);
   ```

### Crear Tabla DynamoDB

1. **Via AWS Console:**
   - Ir a DynamoDB en AWS Console
   - Clic en "Create table"
   - Nombre: `mi-tabla-ejemplo`
   - Partition key: `id` (String)
   - Configuraciones por defecto

2. **Via AWS CLI:**
   ```bash
   aws dynamodb create-table \
     --table-name mi-tabla-ejemplo \
     --attribute-definitions AttributeName=id,AttributeType=S \
     --key-schema AttributeName=id,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

## 🛡️ Configurar Permisos IAM

### Permisos Mínimos para S3

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::mi-bucket-unico-123/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::mi-bucket-unico-123"
    }
  ]
}
```

### Permisos Mínimos para DynamoDB

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
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/mi-tabla-ejemplo"
    }
  ]
}
```

## 🧪 Probar la Configuración

### Test de Conexión

```bash
# Probar credenciales AWS
aws sts get-caller-identity

# Probar acceso a S3
aws s3 ls

# Probar acceso a DynamoDB
aws dynamodb list-tables --region us-east-1
```

### Ejecutar la Aplicación

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Configurar proyecto
npm run setup

# Ejecutar aplicación
npm start
```

### Verificar URLs Firmadas

Si todo está configurado correctamente, deberías ver:

```
✅ Configuración AWS validada

📦 Ejemplos de S3:
Buckets disponibles: 1
  - mi-bucket-unico-123 (creado: 2024-XX-XX...)

Subiendo archivo a mi-bucket-unico-123/test-file.txt...
✅ Archivo subido exitosamente

🔗 Ejemplos de URLs firmadas:
🔽 Generando URL firmada para descarga (1 hora):
URL de descarga: https://mi-bucket-unico-123.s3.amazonaws.com/signed-url-example.txt?X-Amz-Algorithm=...
⏰ Esta URL expira en 1 hora
```

## 🔧 Solución de Problemas

### Error: "The AWS Access Key Id you provided does not exist"

**Causa:** Credenciales incorrectas o no configuradas

**Solución:**
1. Verificar archivo `.env`
2. Comprobar AWS CLI: `aws sts get-caller-identity`
3. Regenerar credenciales en AWS Console

### Error: "AllAccessDisabled" o "Access Denied"

**Causa:** Permisos IAM insuficientes

**Solución:**
1. Verificar políticas IAM del usuario
2. Comprobar políticas del bucket S3
3. Verificar permisos de la tabla DynamoDB

### Error: "NoSuchBucket" o "ResourceNotFoundException"

**Causa:** Recursos no existen

**Solución:**
1. Crear bucket S3 en AWS Console
2. Crear tabla DynamoDB
3. Verificar nombres en archivo `.env`

### Error: "Region mismatch"

**Causa:** Región incorrecta

**Solución:**
1. Verificar `AWS_REGION` en `.env`
2. Comprobar que recursos están en la misma región
3. Usar `aws configure list` para ver configuración

## 💡 Consejos de Configuración

### Para Desarrollo Local
- Usar variables de entorno en `.env`
- Crear recursos en `us-east-1` (región principal)
- Usar nombres únicos para buckets S3
- Activar logging para debugging

### Para Producción
- Usar roles IAM en lugar de credenciales estáticas
- Configurar rotación de credenciales
- Usar AWS Secrets Manager para datos sensibles
- Implementar monitoring y alertas

### Para Equipos
- Usar AWS SSO para gestión centralizada
- Crear perfiles separados por ambiente (dev/staging/prod)
- Documentar convenciones de nomenclatura
- Implementar políticas de tagging

## 📋 Checklist de Configuración

- [ ] Credenciales AWS configuradas (Access Key + Secret)
- [ ] Región AWS especificada
- [ ] Bucket S3 creado con nombre único
- [ ] Tabla DynamoDB creada con partition key `id`
- [ ] Permisos IAM configurados para S3 y DynamoDB
- [ ] Variables de entorno en archivo `.env`
- [ ] Dependencias npm instaladas
- [ ] Tests pasando: `npm test`
- [ ] Aplicación ejecutándose: `npm start`

Una vez completado este checklist, todas las funcionalidades del proyecto deberían funcionar correctamente, incluyendo las URLs firmadas de S3.
