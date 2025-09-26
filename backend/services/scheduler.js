const cron = require('node-cron')
const { getCourses, getCourseWork, getSubmissions } = require('./classroom')
const { sendWhatsAppMessage, isWhatsAppReady } = require('./whatsapp')
const { notifyDueSoonEmail, isEmailReady } = require('./email')
const { google } = require('googleapis')

// Simulación de base de datos - en producción usar DB real
let userProfiles = new Map()
let userSessions = new Map() // Para almacenar tokens OAuth

/**
 * Inicializa el sistema de notificaciones programadas
 */
function initializeScheduler() {
  console.log('📅 Inicializando sistema de notificaciones programadas...')
  
  // Ejecutar cada hora para verificar si es momento de enviar notificaciones
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Verificando notificaciones programadas...')
    await checkAndSendNotifications()
  })
  
  // También ejecutar al iniciar para pruebas (opcional)
  // setTimeout(() => checkAndSendNotifications(), 5000)
  
  console.log('✅ Scheduler de notificaciones iniciado')
}

/**
 * Verifica y envía notificaciones según las configuraciones de usuarios
 */
async function checkAndSendNotifications() {
  try {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    console.log(`🕐 Verificando notificaciones para ${currentHour}:${currentMinute.toString().padStart(2, '0')}`)
    
    // Iterar sobre todos los perfiles de usuarios
    for (const [userEmail, profile] of userProfiles) {
      try {
        // Verificar si es el momento de enviar notificación para este usuario
        if (shouldSendNotification(profile, currentHour, currentMinute)) {
          console.log(`📱 Enviando notificaciones a ${userEmail}`)
          await sendUserNotifications(userEmail, profile)
        }
      } catch (error) {
        console.error(`Error enviando notificaciones a ${userEmail}:`, error)
      }
    }
  } catch (error) {
    console.error('Error en checkAndSendNotifications:', error)
  }
}

/**
 * Determina si debe enviar notificación basado en la hora configurada
 */
function shouldSendNotification(profile, currentHour, currentMinute) {
  if (!profile.notificationTime) return false
  
  const [targetHour, targetMinute] = profile.notificationTime.split(':').map(Number)
  
  // Enviar si estamos en la hora exacta (con margen de 5 minutos)
  return currentHour === targetHour && Math.abs(currentMinute - targetMinute) <= 5
}

/**
 * Envía notificaciones a un usuario específico
 */
async function sendUserNotifications(userEmail, profile) {
  try {
    // Obtener sesión OAuth del usuario
    const oauth2Client = userSessions.get(userEmail)
    if (!oauth2Client) {
      console.log(`❌ No hay sesión OAuth para ${userEmail}`)
      return
    }
    
    // Obtener tareas pendientes del usuario
    const pendingTasks = await getUserPendingTasks(oauth2Client, userEmail)
    
    if (pendingTasks.length === 0) {
      console.log(`✅ ${userEmail} no tiene tareas pendientes`)
      return
    }
    
    console.log(`📋 ${userEmail} tiene ${pendingTasks.length} tareas pendientes`)
    
    // Enviar notificaciones según preferencias
    const notifications = []
    
    if (profile.whatsappEnabled && profile.phone) {
      notifications.push(sendWhatsAppNotification(profile.phone, pendingTasks, userEmail))
    }
    
    if (profile.emailEnabled) {
      notifications.push(sendEmailNotification(userEmail, pendingTasks))
    }
    
    await Promise.allSettled(notifications)
    
  } catch (error) {
    console.error(`Error enviando notificaciones a ${userEmail}:`, error)
  }
}

/**
 * Obtiene las tareas pendientes de un usuario
 */
async function getUserPendingTasks(oauth2Client, userEmail) {
  try {
    const courses = await getCourses(oauth2Client, 'alumno', userEmail)
    const pendingTasks = []
    
    for (const course of courses) {
      try {
        const courseWork = await getCourseWork(oauth2Client, course.id)
        
        for (const assignment of courseWork) {
          // Verificar si la tarea está pendiente o próxima a vencer
          if (isTaskPending(assignment)) {
            const submissions = await getSubmissions(oauth2Client, course.id, assignment.id)
            const userSubmission = submissions.find(s => s.userId === userEmail)
            
            // Si no hay entrega o está en estado pendiente
            if (!userSubmission || ['NEW', 'CREATED'].includes(userSubmission.state)) {
              pendingTasks.push({
                courseName: course.name,
                assignmentTitle: assignment.title,
                dueDate: assignment.dueDate,
                dueTime: assignment.dueTime,
                description: assignment.description,
                courseId: course.id,
                assignmentId: assignment.id
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error procesando curso ${course.id}:`, error)
      }
    }
    
    return pendingTasks
  } catch (error) {
    console.error('Error obteniendo tareas pendientes:', error)
    return []
  }
}

/**
 * Determina si una tarea está pendiente o próxima a vencer
 */
function isTaskPending(assignment) {
  if (!assignment.dueDate) return true // Sin fecha límite = siempre pendiente
  
  const now = new Date()
  const dueDate = new Date(
    assignment.dueDate.year,
    assignment.dueDate.month - 1,
    assignment.dueDate.day,
    assignment.dueTime?.hours || 23,
    assignment.dueTime?.minutes || 59
  )
  
  // Considerar pendiente si vence en los próximos 7 días
  const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
  
  return dueDate > now && dueDate <= sevenDaysFromNow
}

/**
 * Envía notificación por WhatsApp
 */
async function sendWhatsAppNotification(phone, pendingTasks, userEmail) {
  try {
    if (!isWhatsAppReady()) {
      console.log('📱 WhatsApp no está listo')
      return
    }
    
    const message = formatWhatsAppMessage(pendingTasks)
    await sendWhatsAppMessage(phone, message)
    
    console.log(`✅ WhatsApp enviado a ${userEmail} (${phone})`)
  } catch (error) {
    console.error(`Error enviando WhatsApp a ${userEmail}:`, error)
  }
}

/**
 * Envía notificación por email
 */
async function sendEmailNotification(userEmail, pendingTasks) {
  try {
    if (!isEmailReady()) {
      console.log('📧 Email no está listo')
      return
    }
    
    // Usar el primer curso como referencia (mejorar en el futuro)
    const firstTask = pendingTasks[0]
    await notifyDueSoonEmail(
      [userEmail], 
      firstTask.courseName, 
      `${pendingTasks.length} tarea(s) pendiente(s)`, 
      firstTask.dueDate
    )
    
    console.log(`✅ Email enviado a ${userEmail}`)
  } catch (error) {
    console.error(`Error enviando email a ${userEmail}:`, error)
  }
}

/**
 * Formatea el mensaje de WhatsApp
 */
function formatWhatsAppMessage(pendingTasks) {
  let message = `🎓 *Recordatorio de Tareas - Semillero Digital*\n\n`
  message += `Tienes *${pendingTasks.length}* tarea(s) pendiente(s):\n\n`
  
  pendingTasks.slice(0, 5).forEach((task, index) => {
    const dueDate = task.dueDate 
      ? new Date(task.dueDate.year, task.dueDate.month - 1, task.dueDate.day).toLocaleDateString('es-AR')
      : 'Sin fecha límite'
    
    message += `${index + 1}. *${task.assignmentTitle}*\n`
    message += `   📚 ${task.courseName}\n`
    message += `   📅 Vence: ${dueDate}\n\n`
  })
  
  if (pendingTasks.length > 5) {
    message += `... y ${pendingTasks.length - 5} tarea(s) más\n\n`
  }
  
  message += `💡 *Tip:* Accede a Google Classroom o nuestro dashboard para completar tus tareas.\n\n`
  message += `¡No dejes para mañana lo que puedes hacer hoy! 💪`
  
  return message
}

/**
 * Registra un perfil de usuario (llamado desde la API)
 */
function setUserProfile(userEmail, profile) {
  userProfiles.set(userEmail, profile)
  console.log(`📱 Perfil registrado para notificaciones: ${userEmail}`)
}

/**
 * Registra una sesión OAuth de usuario (llamado desde auth)
 */
function setUserSession(userEmail, oauth2Client) {
  userSessions.set(userEmail, oauth2Client)
  console.log(`🔑 Sesión OAuth registrada para notificaciones: ${userEmail}`)
}

/**
 * Obtiene estadísticas del scheduler
 */
function getSchedulerStats() {
  return {
    totalUsers: userProfiles.size,
    usersWithWhatsApp: Array.from(userProfiles.values()).filter(p => p.whatsappEnabled).length,
    usersWithEmail: Array.from(userProfiles.values()).filter(p => p.emailEnabled).length,
    activeSessions: userSessions.size
  }
}

/**
 * Envía notificación de prueba (para testing)
 */
async function sendTestNotification(userEmail) {
  try {
    const profile = userProfiles.get(userEmail)
    if (!profile) {
      throw new Error('Perfil no encontrado')
    }
    
    console.log(`🧪 Iniciando notificación de prueba para ${userEmail}`)
    
    // Crear tareas de prueba realistas
    const testTasks = [
      {
        courseName: 'Programación Web',
        assignmentTitle: 'Proyecto Final - Dashboard React',
        dueDate: { year: 2024, month: 12, day: 15 },
        dueTime: { hours: 23, minutes: 59 },
        description: 'Desarrollar un dashboard completo con React y Node.js'
      },
      {
        courseName: 'Base de Datos',
        assignmentTitle: 'Diseño de Schema',
        dueDate: { year: 2024, month: 12, day: 10 },
        dueTime: { hours: 18, minutes: 0 },
        description: 'Crear el diseño de base de datos para el proyecto'
      },
      {
        courseName: 'Metodologías Ágiles',
        assignmentTitle: 'Presentación Scrum',
        dueDate: { year: 2024, month: 12, day: 8 },
        dueTime: { hours: 15, minutes: 30 },
        description: 'Preparar presentación sobre metodología Scrum'
      }
    ]
    
    const results = []
    
    // Enviar WhatsApp si está habilitado
    if (profile.whatsappEnabled && profile.phone) {
      try {
        console.log(`📱 Enviando WhatsApp de prueba a ${profile.phone}`)
        await sendWhatsAppNotification(profile.phone, testTasks, userEmail)
        results.push({ type: 'whatsapp', success: true, phone: profile.phone })
      } catch (error) {
        console.error('Error enviando WhatsApp de prueba:', error)
        results.push({ type: 'whatsapp', success: false, error: error.message })
      }
    }
    
    // Enviar Email si está habilitado
    if (profile.emailEnabled) {
      try {
        console.log(`📧 Enviando Email de prueba a ${userEmail}`)
        await sendEmailNotification(userEmail, testTasks)
        results.push({ type: 'email', success: true, email: userEmail })
      } catch (error) {
        console.error('Error enviando Email de prueba:', error)
        results.push({ type: 'email', success: false, error: error.message })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    return { 
      success: successCount > 0, 
      message: `Notificación de prueba enviada (${successCount}/${totalCount} exitosas)`,
      results,
      testTasks: testTasks.length
    }
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  initializeScheduler,
  setUserProfile,
  setUserSession,
  getSchedulerStats,
  sendTestNotification,
  checkAndSendNotifications // Para testing manual
}
