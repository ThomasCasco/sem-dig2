const express = require('express')
const { requireAuth, requireRole } = require('./auth')
const {
  getCourses,
  getCourseWork,
  getSubmissions,
  getCourseStudents,
  getStudentProgress,
  getGlobalMetrics
} = require('../services/classroom')
const { setUserProfile, setUserSession, sendTestNotification, getSchedulerStats } = require('../services/scheduler')

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth)

/**
 * GET /api/courses
 * Obtiene los cursos accesibles para el usuario actual
 */
router.get('/courses', async (req, res) => {
  try {
    const courses = await getCourses(req.oauth2Client, req.user.role, req.user.email)
    res.json(courses)
  } catch (error) {
    console.error('Error en /api/courses:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/courses/:courseId/coursework
 * Obtiene las tareas de un curso específico
 */
router.get('/courses/:courseId/coursework', async (req, res) => {
  try {
    const { courseId } = req.params
    const courseWork = await getCourseWork(req.oauth2Client, courseId)
    res.json(courseWork)
  } catch (error) {
    console.error('Error en /api/courses/:courseId/coursework:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/courses/:courseId/students
 * Obtiene los estudiantes de un curso (solo profesores y coordinadores)
 */
router.get('/courses/:courseId/students', requireRole(['profesor', 'coordinador']), async (req, res) => {
  try {
    const { courseId } = req.params
    const students = await getCourseStudents(req.oauth2Client, courseId)
    res.json(students)
  } catch (error) {
    console.error('Error en /api/courses/:courseId/students:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/courses/:courseId/coursework/:courseWorkId/submissions
 * Obtiene las entregas de una tarea específica
 */
router.get('/courses/:courseId/coursework/:courseWorkId/submissions', async (req, res) => {
  try {
    const { courseId, courseWorkId } = req.params
    const submissions = await getSubmissions(req.oauth2Client, courseId, courseWorkId)
    res.json(submissions)
  } catch (error) {
    console.error('Error en /api/submissions:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/progress/:courseId/:studentId?
 * Obtiene el progreso de un estudiante en un curso
 * Si no se especifica studentId, usa el usuario actual (para alumnos)
 */
router.get('/progress/:courseId/:studentId?', async (req, res) => {
  try {
    const { courseId, studentId } = req.params
    
    // Si no se especifica studentId, usar el usuario actual
    const targetStudentId = studentId || req.user.id
    
    // Verificar permisos: alumnos solo pueden ver su propio progreso
    if (req.user.role === 'alumno' && targetStudentId !== req.user.id) {
      return res.status(403).json({ error: 'No puedes ver el progreso de otros estudiantes' })
    }

    const progress = await getStudentProgress(req.oauth2Client, courseId, targetStudentId)
    res.json(progress)
  } catch (error) {
    console.error('Error en /api/progress:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/submissions
 * Obtiene entregas con filtros aplicados
 */
router.get('/submissions', async (req, res) => {
  try {
    const { cohorte, profesor, estado, courseId } = req.query
    
    // Obtener cursos base
    let courses = await getCourses(req.oauth2Client, req.user.role, req.user.email)
    
    // Aplicar filtro de cohorte/curso
    if (cohorte || courseId) {
      const targetCourseId = courseId || cohorte
      courses = courses.filter(course => course.id === targetCourseId)
    }
    
    // Aplicar filtro de profesor
    if (profesor && req.user.role === 'coordinador') {
      courses = courses.filter(course => 
        course.primaryTeacher?.email === profesor
      )
    }

    const allSubmissions = []

    for (const course of courses) {
      try {
        const courseWork = await getCourseWork(req.oauth2Client, course.id)
        
        for (const assignment of courseWork) {
          const submissions = await getSubmissions(req.oauth2Client, course.id, assignment.id)
          
          // Enriquecer submissions con información adicional
          const enrichedSubmissions = submissions.map(submission => {
            const status = getSubmissionStatus(assignment, submission)
            
            // Aplicar filtro de estado si se especifica
            if (estado && status !== estado) {
              return null
            }
            
            return {
              ...submission,
              courseId: course.id,
              courseName: course.name,
              assignmentId: assignment.id,
              assignmentTitle: assignment.title,
              dueDate: assignment.dueDate,
              status
            }
          }).filter(Boolean) // Remover nulls
          
          allSubmissions.push(...enrichedSubmissions)
        }
      } catch (error) {
        console.error(`Error procesando curso ${course.id}:`, error)
      }
    }

    res.json(allSubmissions)
  } catch (error) {
    console.error('Error en /api/submissions con filtros:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/metrics
 * Obtiene métricas globales (solo coordinadores)
 */
router.get('/metrics', requireRole(['coordinador']), async (req, res) => {
  try {
    const metrics = await getGlobalMetrics(req.oauth2Client)
    res.json(metrics)
  } catch (error) {
    console.error('Error en /api/metrics:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/dashboard
 * Obtiene datos del dashboard según el rol del usuario
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { role, id: userId } = req.user
    
    if (role === 'alumno') {
      // Dashboard para alumno: sus cursos y progreso
      const courses = await getCourses(req.oauth2Client, role, req.user.email)
      
      const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          try {
            const progress = await getStudentProgress(req.oauth2Client, course.id, userId)
            return {
              ...course,
              progress
            }
          } catch (error) {
            console.error(`Error obteniendo progreso para curso ${course.id}:`, error)
            return {
              ...course,
              progress: { totalAssignments: 0, completedAssignments: 0, percentage: 0 }
            }
          }
        })
      )
      
      res.json({
        role,
        courses: coursesWithProgress,
        totalCourses: coursesWithProgress.length,
        averageProgress: coursesWithProgress.length > 0 
          ? Math.round(coursesWithProgress.reduce((sum, c) => sum + c.progress.percentage, 0) / coursesWithProgress.length)
          : 0
      })
      
    } else if (role === 'profesor') {
      // Dashboard para profesor: sus clases y estudiantes
      const courses = await getCourses(req.oauth2Client, role, req.user.email)
      
      const coursesWithStudents = await Promise.all(
        courses.map(async (course) => {
          try {
            const students = await getCourseStudents(req.oauth2Client, course.id)
            const courseWork = await getCourseWork(req.oauth2Client, course.id)
            
            return {
              ...course,
              students: students.length,
              assignments: courseWork.length
            }
          } catch (error) {
            console.error(`Error obteniendo datos para curso ${course.id}:`, error)
            return {
              ...course,
              students: 0,
              assignments: 0
            }
          }
        })
      )
      
      res.json({
        role,
        courses: coursesWithStudents,
        totalCourses: coursesWithStudents.length,
        totalStudents: coursesWithStudents.reduce((sum, c) => sum + c.students, 0),
        totalAssignments: coursesWithStudents.reduce((sum, c) => sum + c.assignments, 0)
      })
      
    } else if (role === 'coordinador') {
      // Dashboard para coordinador: métricas globales
      const metrics = await getGlobalMetrics(req.oauth2Client)
      
      res.json({
        role,
        ...metrics
      })
    }
    
  } catch (error) {
    console.error('Error en /api/dashboard:', error)
    res.status(500).json({ error: error.message })
  }
})

// Simulación de base de datos en memoria para perfiles
// En producción, usar una base de datos real
const userProfiles = new Map()

/**
 * GET /api/profile
 * Obtiene el perfil del usuario actual
 */
router.get('/profile', async (req, res) => {
  try {
    const userEmail = req.user.email
    const profile = userProfiles.get(userEmail) || {
      phone: '',
      whatsappEnabled: false,
      emailEnabled: true,
      notificationTime: '17:00',
      timezone: 'America/Argentina/Buenos_Aires'
    }
    
    res.json(profile)
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * POST /api/profile
 * Actualiza el perfil del usuario actual
 */
router.post('/profile', async (req, res) => {
  try {
    const userEmail = req.user.email
    const { phone, whatsappEnabled, emailEnabled, notificationTime, timezone } = req.body
    
    // Validaciones
    if (whatsappEnabled && !phone) {
      return res.status(400).json({ 
        error: 'Número de teléfono requerido para habilitar WhatsApp' 
      })
    }
    
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ 
        error: 'Formato de teléfono inválido' 
      })
    }
    
    // Guardar perfil
    const profile = {
      phone: phone || '',
      whatsappEnabled: Boolean(whatsappEnabled),
      emailEnabled: Boolean(emailEnabled),
      notificationTime: notificationTime || '17:00',
      timezone: timezone || 'America/Argentina/Buenos_Aires',
      updatedAt: new Date().toISOString()
    }
    
    userProfiles.set(userEmail, profile)
    
    // Registrar perfil en el scheduler para notificaciones
    setUserProfile(userEmail, profile)
    
    // Registrar sesión OAuth si está disponible
    if (req.oauth2Client) {
      setUserSession(userEmail, req.oauth2Client)
    }
    
    console.log(`📱 Perfil actualizado para ${userEmail}:`, profile)
    
    res.json({ 
      message: 'Perfil actualizado correctamente',
      profile 
    })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * POST /api/profile/test-notification
 * Envía una notificación de prueba al usuario actual
 */
router.post('/profile/test-notification', async (req, res) => {
  try {
    const userEmail = req.user.email
    const profile = userProfiles.get(userEmail)
    
    if (!profile) {
      return res.status(400).json({ 
        error: 'Debes configurar tu perfil primero' 
      })
    }
    
    if (!profile.whatsappEnabled && !profile.emailEnabled) {
      return res.status(400).json({ 
        error: 'Debes habilitar al menos un método de notificación' 
      })
    }
    
    // Registrar sesión OAuth para las notificaciones
    if (req.oauth2Client) {
      setUserSession(userEmail, req.oauth2Client)
    }
    
    console.log(`🧪 Enviando notificación de prueba a ${userEmail}`)
    
    // Enviar notificación de prueba
    const result = await sendTestNotification(userEmail)
    
    if (result.success) {
      res.json({ 
        message: 'Notificación de prueba enviada correctamente',
        details: result
      })
    } else {
      res.status(500).json({ 
        error: result.error || 'Error enviando notificación de prueba'
      })
    }
    
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * GET /api/scheduler/stats
 * Obtiene estadísticas del scheduler (solo coordinadores)
 */
router.get('/scheduler/stats', requireRole(['coordinador']), async (req, res) => {
  try {
    const stats = getSchedulerStats()
    res.json(stats)
  } catch (error) {
    console.error('Error obteniendo estadísticas del scheduler:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Función helper para determinar estado de entrega
function getSubmissionStatus(assignment, submission) {
  if (!submission) {
    return 'faltante'
  }

  const now = new Date()
  const dueDate = assignment.dueDate ? new Date(
    assignment.dueDate.year,
    assignment.dueDate.month - 1,
    assignment.dueDate.day,
    assignment.dueTime?.hours || 23,
    assignment.dueTime?.minutes || 59
  ) : null

  switch (submission.state) {
    case 'TURNED_IN':
    case 'RETURNED':
      return 'entregado'
    case 'RECLAIMED_BY_STUDENT':
      return 'reentrega'
    case 'NEW':
    case 'CREATED':
      if (dueDate && now > dueDate) {
        return 'atrasado'
      }
      return 'pendiente'
    default:
      return 'desconocido'
  }
}

// Función para validar teléfono argentino
function isValidPhone(phone) {
  const phoneRegex = /^\+54\s?9?\s?\d{2,4}\s?\d{4}-?\d{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

module.exports = router
