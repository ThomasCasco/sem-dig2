const express = require('express')
const session = require('express-session')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
// Cargar variables de entorno
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' })
}

const { router: authRoutes } = require('./routes/auth')
const apiRoutes = require('./routes/api')
const { initializeWhatsApp } = require('./services/whatsapp')
const { initializeEmail } = require('./services/email')
const { initializeScheduler } = require('./services/scheduler')
const { keepAlive } = require('./services/keepAlive')

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana por IP
})
app.use(limiter)

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true)
    
    // Permitir localhost y URLs específicas
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    
    // Permitir todas las URLs de Vercel (preview y producción)
    if (origin && (
      origin.includes('.vercel.app') || 
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    )) {
      return callback(null, true)
    }
    
    console.log('CORS blocked origin:', origin)
    callback(new Error('No permitido por CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'semillero-digital-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Permitir cookies entre dominios
  }
}))

// Debug middleware para sesiones
app.use((req, res, next) => {
  if (req.path.includes('/auth/me')) {
    console.log('🔍 Debug sesión:', {
      sessionID: req.sessionID,
      hasUser: !!req.session.user,
      cookies: req.headers.cookie,
      origin: req.headers.origin
    })
  }
  next()
})

// Routes
app.use('/auth', authRoutes)
app.use('/api', apiRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' })
})

// Initialize WhatsApp if enabled
if (process.env.WHATSAPP_ENABLED === 'true') {
  initializeWhatsApp()
}

// Initialize Email if enabled
if (process.env.EMAIL_ENABLED === 'true') {
  console.log('📧 Inicializando servicio de email...')
  initializeEmail()
} else {
  console.log('📧 Servicio de email deshabilitado')
}

// Initialize Scheduler for notifications
initializeScheduler()

app.listen(PORT, () => {
  // Inicializar servicios
  initializeWhatsApp()
  initializeEmail()
  initializeScheduler()
  // keepAlive() // Mantener el servicio activo - temporalmente deshabilitado
  
  console.log('🚀 Servidor ejecutándose en puerto', PORT)
  console.log('📚 Semillero Digital Dashboard API')
  console.log('🌍 Entorno:', process.env.NODE_ENV || 'development')
  console.log('🔑 Google Client ID configurado:', !!process.env.GOOGLE_CLIENT_ID ? 'SÍ' : 'NO')
  console.log('🔐 Google Client Secret configurado:', !!process.env.GOOGLE_CLIENT_SECRET ? 'SÍ' : 'NO')
})
