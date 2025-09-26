const nodemailer = require('nodemailer')

let transporter = null

/**
 * Inicializa el servicio de email
 */
function initializeEmail() {
  if (process.env.EMAIL_ENABLED !== 'true') {
    console.log('📧 Email deshabilitado')
    return
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Credenciales de email no configuradas')
    return
  }

  console.log('📧 Inicializando servicio de email...')
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App Password, no la contraseña normal
    }
  })

  // Verificar conexión
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Error configurando email:', error)
      transporter = null
    } else {
      console.log('✅ Servicio de email listo')
    }
  })
}

/**
 * Envía un email
 */
async function sendEmail(to, subject, html, text = null) {
  if (!transporter) {
    throw new Error('Servicio de email no disponible')
  }

  try {
    const mailOptions = {
      from: `"Semillero Digital" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Fallback text sin HTML
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Email enviado: ${info.messageId}`)
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error enviando email:', error)
    throw new Error('No se pudo enviar el email')
  }
}

/**
 * Verifica si el servicio de email está disponible
 */
function isEmailReady() {
  return transporter !== null
}

/**
 * Obtiene el estado del servicio de email
 */
function getEmailStatus() {
  return {
    enabled: process.env.EMAIL_ENABLED === 'true',
    ready: transporter !== null,
    user: process.env.EMAIL_USER || 'No configurado'
  }
}

/**
 * Envía notificación de nueva tarea por email
 */
async function notifyNewAssignmentEmail(emails, courseName, assignmentTitle, dueDate) {
  if (!transporter) {
    console.log('Email no está listo para enviar notificaciones')
    return
  }

  const dueDateStr = dueDate 
    ? new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString('es-CO')
    : 'Sin fecha límite'

  const subject = `📚 Nueva tarea: ${assignmentTitle}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📚 Semillero Digital</h1>
        <p style="margin: 5px 0 0 0;">Nueva tarea asignada</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937; margin-top: 0;">Nueva tarea en ${courseName}</h2>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>📝 Tarea:</strong> ${assignmentTitle}</p>
          <p><strong>📅 Fecha límite:</strong> ${dueDateStr}</p>
          <p><strong>📚 Curso:</strong> ${courseName}</p>
        </div>
        
        <p style="color: #6b7280;">
          ¡No olvides completar tu tarea a tiempo! Puedes acceder a Google Classroom 
          o usar nuestro dashboard para hacer seguimiento de tu progreso.
        </p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://classroom.google.com" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Ir a Google Classroom
          </a>
        </div>
      </div>
      
      <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Este es un mensaje automático de Semillero Digital Dashboard</p>
        <p>Si no deseas recibir estas notificaciones, contacta a tu coordinador</p>
      </div>
    </div>
  `

  const results = []
  
  for (const email of emails) {
    try {
      await sendEmail(email, subject, html)
      results.push({ email, success: true })
    } catch (error) {
      console.error(`Error enviando email a ${email}:`, error)
      results.push({ email, success: false, error: error.message })
    }
  }

  return results
}

/**
 * Envía recordatorio de tarea próxima a vencer por email
 */
async function notifyDueSoonEmail(emails, courseName, assignmentTitle, dueDate) {
  if (!transporter) {
    console.log('Email no está listo para enviar recordatorios')
    return
  }

  const dueDateStr = new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString('es-CO')
  const subject = `⏰ Recordatorio: ${assignmentTitle} vence pronto`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">⏰ Semillero Digital</h1>
        <p style="margin: 5px 0 0 0;">Recordatorio de tarea</p>
      </div>
      
      <div style="padding: 20px; background-color: #fef3c7;">
        <h2 style="color: #92400e; margin-top: 0;">¡Tu tarea vence pronto!</h2>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <p><strong>📝 Tarea:</strong> ${assignmentTitle}</p>
          <p><strong>📅 Vence:</strong> ${dueDateStr}</p>
          <p><strong>📚 Curso:</strong> ${courseName}</p>
        </div>
        
        <p style="color: #92400e;">
          <strong>¡Quedan pocos días!</strong> No olvides completar tu tarea antes de la fecha límite.
        </p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://classroom.google.com" 
             style="background-color: #f59e0b; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Completar Tarea
          </a>
        </div>
      </div>
      
      <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Este es un mensaje automático de Semillero Digital Dashboard</p>
      </div>
    </div>
  `

  const results = []
  
  for (const email of emails) {
    try {
      await sendEmail(email, subject, html)
      results.push({ email, success: true })
    } catch (error) {
      console.error(`Error enviando recordatorio a ${email}:`, error)
      results.push({ email, success: false, error: error.message })
    }
  }

  return results
}

/**
 * Envía reporte semanal por email
 */
async function sendWeeklyReport(coordinatorEmails, reportData) {
  if (!transporter) {
    console.log('Email no está listo para enviar reportes')
    return
  }

  const subject = `📊 Reporte Semanal - Semillero Digital`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #7c3aed; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">📊 Semillero Digital</h1>
        <p style="margin: 5px 0 0 0;">Reporte Semanal</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9fafb;">
        <h2 style="color: #1f2937; margin-top: 0;">Resumen de la Semana</h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #3b82f6;">${reportData.totalCourses}</h3>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Cursos Activos</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #10b981;">${reportData.totalStudents}</h3>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Estudiantes</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #f59e0b;">${reportData.totalSubmissions}</h3>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Entregas</p>
          </div>
          <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #7c3aed;">${reportData.globalOnTimePercentage}%</h3>
            <p style="margin: 5px 0 0 0; color: #6b7280;">A Tiempo</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/reportes" 
             style="background-color: #7c3aed; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Reporte Completo
          </a>
        </div>
      </div>
      
      <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>Reporte generado automáticamente por Semillero Digital Dashboard</p>
      </div>
    </div>
  `

  const results = []
  
  for (const email of coordinatorEmails) {
    try {
      await sendEmail(email, subject, html)
      results.push({ email, success: true })
    } catch (error) {
      console.error(`Error enviando reporte a ${email}:`, error)
      results.push({ email, success: false, error: error.message })
    }
  }

  return results
}

module.exports = {
  initializeEmail,
  sendEmail,
  isEmailReady,
  getEmailStatus,
  notifyNewAssignmentEmail,
  notifyDueSoonEmail,
  sendWeeklyReport
}
