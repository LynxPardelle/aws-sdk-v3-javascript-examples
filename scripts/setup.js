#!/usr/bin/env node

/**
 * Script de configuración inicial para el proyecto AWS SDK v3
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
  console.log('🚀 Configurando proyecto AWS SDK v3...\n');

  try {
    // Verificar si .env existe
    const envPath = path.join(__dirname, '..', '.env');
    
    try {
      await fs.access(envPath);
      console.log('✅ Archivo .env ya existe');
    } catch {
      // .env no existe, copiarlo desde .env.example
      const envExamplePath = path.join(__dirname, '..', '.env.example');
      try {
        const envExample = await fs.readFile(envExamplePath, 'utf-8');
        await fs.writeFile(envPath, envExample);
        console.log('✅ Archivo .env creado desde .env.example');
        console.log('⚠️  Recuerda configurar tus credenciales AWS en el archivo .env');
      } catch (error) {
        console.error('❌ Error copiando .env.example:', error.message);
      }
    }

    // Verificar Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      console.log(`✅ Node.js ${nodeVersion} es compatible`);
    } else {
      console.log(`⚠️  Node.js ${nodeVersion} detectado. Se recomienda Node.js 18 o superior`);
    }

    // Verificar que las dependencias estén instaladas
    try {
      await fs.access(path.join(__dirname, '..', 'node_modules'));
      console.log('✅ Dependencias instaladas');
    } catch {
      console.log('❌ Dependencias no instaladas. Ejecuta: npm install');
    }

    console.log('\n🎯 Pasos siguientes:');
    console.log('1. Configura tus credenciales AWS en el archivo .env');
    console.log('2. Ejecuta: npm start');
    console.log('3. Para desarrollo: npm run dev');
    console.log('\n📖 Consulta el README.md para más información');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setup();
