#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Configurando Semillero Digital Dashboard...\n')

// Verificar Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 16) {
  console.error('❌ Error: Se requiere Node.js 16 o superior')
  console.error(`   Versión actual: ${nodeVersion}`)
  console.error('   Descarga la última versión desde: https://nodejs.org/')
  process.exit(1)
}

console.log(`✅ Node.js ${nodeVersion} - OK`)

// Verificar si existe .env
const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📄 Copiando .env.example a .env...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Archivo .env creado')
    console.log('⚠️  IMPORTANTE: Configura las variables en .env antes de continuar')
  } else {
    console.error('❌ Error: No se encontró .env.example')
    process.exit(1)
  }
} else {
  console.log('✅ Archivo .env encontrado')
}

// Instalar dependencias
console.log('\n📦 Instalando dependencias...')

try {
  console.log('   - Instalando dependencias raíz...')
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
  
  console.log('   - Instalando dependencias del backend...')
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'backend') })
  
  console.log('   - Instalando dependencias del frontend...')
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'frontend') })
  
  console.log('✅ Todas las dependencias instaladas')
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message)
  process.exit(1)
}

// Verificar configuración de .env
console.log('\n🔍 Verificando configuración...')

const envContent = fs.readFileSync(envPath, 'utf8')
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET'
]

const missingVars = []
requiredVars.forEach(varName => {
  if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your_`)) {
    missingVars.push(varName)
  }
})

if (missingVars.length > 0) {
  console.log('⚠️  Variables de entorno pendientes de configurar:')
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`)
  })
  console.log('\n📋 Pasos siguientes:')
  console.log('   1. Configura Google Cloud Console')
  console.log('   2. Obtén las credenciales OAuth 2.0')
  console.log('   3. Actualiza el archivo .env')
  console.log('   4. Ejecuta: npm run dev')
  console.log('\n📖 Ver SETUP.md para instrucciones detalladas')
} else {
  console.log('✅ Configuración básica completa')
  console.log('\n🎉 ¡Listo para ejecutar!')
  console.log('   Ejecuta: npm run dev')
}

console.log('\n📚 Recursos útiles:')
console.log('   - Documentación: README.md')
console.log('   - Configuración rápida: SETUP.md')
console.log('   - Google Cloud Console: https://console.cloud.google.com/')
console.log('   - Soporte: GitHub Issues')

console.log('\n✨ ¡Gracias por usar Semillero Digital Dashboard!')
