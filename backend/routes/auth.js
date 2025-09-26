const express = require('express')
const { google } = require('googleapis')
const { getUserRole } = require('../services/classroom')

const router = express.Router()

// Configuración OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Scopes necesarios para Google Classroom
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

// Ruta para iniciar el proceso de autenticación
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
  
  res.redirect(authUrl)
})

// Callback de Google OAuth
router.get('/callback', async (req, res) => {
  const { code } = req.query
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`)
  }

  try {
    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Obtener información del usuario
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    // Determinar el rol del usuario
    const userRole = await getUserRole(oauth2Client, userInfo.email)

    // Guardar información en la sesión
    req.session.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      role: userRole,
      tokens: tokens
    }

    console.log(`✅ Usuario autenticado: ${userInfo.email} (${userRole})`)
    
    // Redirigir al frontend con éxito
    res.redirect(`${process.env.FRONTEND_URL}?auth=success`)
    
  } catch (error) {
    console.error('Error en callback de autenticación:', error)
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`)
  }
})

// Obtener información del usuario actual
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  // No enviar tokens al frontend por seguridad
  const { tokens, ...userInfo } = req.session.user
  res.json(userInfo)
})

// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err)
      return res.status(500).json({ error: 'Error al cerrar sesión' })
    }
    
    res.json({ message: 'Sesión cerrada exitosamente' })
  })
})

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Autenticación requerida' })
  }
  
  // Configurar cliente OAuth con tokens de la sesión
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  oauth2Client.setCredentials(req.session.user.tokens)
  
  req.oauth2Client = oauth2Client
  req.user = req.session.user
  next()
}

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes' })
    }
    next()
  }
}

module.exports = { router, requireAuth, requireRole }
