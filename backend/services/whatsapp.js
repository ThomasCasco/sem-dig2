const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

let whatsappClient = null
let isReady = false

/**
 * Inicializa el cliente de WhatsApp
 */
function initializeWhatsApp() {
  if (process.env.WHATSAPP_ENABLED !== 'true') {
    console.log('📱 WhatsApp deshabilitado')
    return
  }

  console.log('📱 Inicializando WhatsApp Web...')
  
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: '.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  })

  whatsappClient.on('qr', (qr) => {
    console.log('📱 Escanea este código QR con WhatsApp:')
    qrcode.generate(qr, { small: true })
  })

  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Web está listo!')
    isReady = true
  })

  whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp autenticado')
  })

  whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación WhatsApp:', msg)
  })

  whatsappClient.on('disconnected', (reason) => {
    console.log('📱 WhatsApp desconectado:', reason)
    isReady = false
  })

  whatsappClient.initialize()
}

/**
 * Envía un mensaje de WhatsApp
 */
async function sendWhatsAppMessage(phoneNumber, message) {
  if (!whatsappClient || !isReady) {
    throw new Error('WhatsApp no está disponible')
  }

  try {
    // Formatear número de teléfono (agregar código de país si no lo tiene)
    let formattedNumber = phoneNumber.replace(/\D/g, '') // Solo números
    
    if (!formattedNumber.startsWith('57')) { // Colombia
      formattedNumber = '57' + formattedNumber
    }
    
    const chatId = formattedNumber + '@c.us'
    
    await whatsappClient.sendMessage(chatId, message)
    console.log(`✅ Mensaje enviado a ${phoneNumber}`)
    
    return { success: true, message: 'Mensaje enviado' }
  } catch (error) {
    console.error('Error enviando mensaje WhatsApp:', error)
    throw new Error('No se pudo enviar el mensaje')
  }
}

/**
 * Verifica si WhatsApp está listo
 */
function isWhatsAppReady() {
  return isReady
}

/**
 * Obtiene el estado de WhatsApp
 */
function getWhatsAppStatus() {
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    ready: isReady,
    client: whatsappClient ? 'initialized' : 'not_initialized'
  }
}

/**
 * Envía notificación de nueva tarea
 */
async function notifyNewAssignment(phoneNumbers, courseName, assignmentTitle, dueDate) {
  if (!isReady) {
    console.log('WhatsApp no está listo para enviar notificaciones')
    return
  }

  const dueDateStr = dueDate 
    ? new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString('es-CO')
    : 'Sin fecha límite'

  const message = `📚 *Nueva tarea en ${courseName}*\n\n` +
                 `📝 *Tarea:* ${assignmentTitle}\n` +
                 `📅 *Fecha límite:* ${dueDateStr}\n\n` +
                 `¡No olvides completarla a tiempo! 🎯`

  const results = []
  
  for (const phoneNumber of phoneNumbers) {
    try {
      await sendWhatsAppMessage(phoneNumber, message)
      results.push({ phoneNumber, success: true })
    } catch (error) {
      console.error(`Error enviando a ${phoneNumber}:`, error)
      results.push({ phoneNumber, success: false, error: error.message })
    }
  }

  return results
}

/**
 * Envía recordatorio de tarea próxima a vencer
 */
async function notifyDueSoon(phoneNumbers, courseName, assignmentTitle, dueDate) {
  if (!isReady) {
    console.log('WhatsApp no está listo para enviar recordatorios')
    return
  }

  const dueDateStr = new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString('es-CO')

  const message = `⏰ *Recordatorio de tarea*\n\n` +
                 `📚 *Curso:* ${courseName}\n` +
                 `📝 *Tarea:* ${assignmentTitle}\n` +
                 `📅 *Vence:* ${dueDateStr}\n\n` +
                 `¡Quedan pocos días! ⚡`

  const results = []
  
  for (const phoneNumber of phoneNumbers) {
    try {
      await sendWhatsAppMessage(phoneNumber, message)
      results.push({ phoneNumber, success: true })
    } catch (error) {
      console.error(`Error enviando recordatorio a ${phoneNumber}:`, error)
      results.push({ phoneNumber, success: false, error: error.message })
    }
  }

  return results
}

module.exports = {
  initializeWhatsApp,
  sendWhatsAppMessage,
  isWhatsAppReady,
  getWhatsAppStatus,
  notifyNewAssignment,
  notifyDueSoon
}
