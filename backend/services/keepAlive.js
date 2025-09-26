// Servicio para mantener Render activo
const axios = require('axios')

const BACKEND_URL = process.env.BACKEND_URL || 'https://sem-dig2.onrender.com'

const keepAlive = () => {
  // Solo en producción
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  console.log('🏃 Iniciando servicio keep-alive...')
  
  // Ping cada 10 minutos para evitar que se duerma
  setInterval(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 5000
      })
      console.log('💓 Keep-alive ping exitoso:', response.data.timestamp)
    } catch (error) {
      console.log('❌ Keep-alive ping falló:', error.message)
    }
  }, 10 * 60 * 1000) // 10 minutos
}

module.exports = { keepAlive }
