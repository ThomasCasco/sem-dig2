import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  User, 
  Phone, 
  Mail, 
  Bell, 
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Send,
  Zap
} from 'lucide-react'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    phone: '',
    whatsappEnabled: false,
    emailEnabled: true,
    notificationTime: '17:00', // 5 PM
    timezone: 'America/Argentina/Buenos_Aires'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/profile')
      setProfile(prev => ({ ...prev, ...response.data }))
    } catch (error) {
      console.error('Error cargando perfil:', error)
      // Si no existe perfil, usar valores por defecto
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setMessage(null)

      // Validar número de teléfono si WhatsApp está habilitado
      if (profile.whatsappEnabled && !profile.phone) {
        setMessage({
          type: 'error',
          text: 'Debes agregar un número de teléfono para habilitar WhatsApp'
        })
        return
      }

      // Validar formato de teléfono
      if (profile.phone && !isValidPhone(profile.phone)) {
        setMessage({
          type: 'error',
          text: 'Formato de teléfono inválido. Usa: +54 9 11 1234-5678'
        })
        return
      }

      await axios.post('/api/profile', profile)
      
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000)

    } catch (error) {
      console.error('Error guardando perfil:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error guardando el perfil'
      })
    } finally {
      setSaving(false)
    }
  }

  const isValidPhone = (phone) => {
    // Validar formato argentino: +54 9 11 1234-5678 o similar
    const phoneRegex = /^\+54\s?9?\s?\d{2,4}\s?\d{4}-?\d{4}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const formatPhoneInput = (value) => {
    // Auto-formatear mientras escribe
    let cleaned = value.replace(/\D/g, '')
    
    if (cleaned.startsWith('54')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('9') && cleaned.length > 1) {
      cleaned = '+54 ' + cleaned
    } else if (cleaned.length > 0 && !cleaned.startsWith('+54')) {
      cleaned = '+54 9 ' + cleaned
    }

    return cleaned
  }

  const handleTestNotification = async () => {
    try {
      setTesting(true)
      setMessage(null)

      // Validar que tenga al menos un método habilitado
      if (!profile.whatsappEnabled && !profile.emailEnabled) {
        setMessage({
          type: 'error',
          text: 'Debes habilitar al menos WhatsApp o Email para probar las notificaciones'
        })
        return
      }

      // Validar WhatsApp si está habilitado
      if (profile.whatsappEnabled && !profile.phone) {
        setMessage({
          type: 'error',
          text: 'Debes agregar un número de teléfono para probar WhatsApp'
        })
        return
      }

      const response = await axios.post('/api/profile/test-notification')
      
      setMessage({
        type: 'success',
        text: `¡Notificación de prueba enviada! ${response.data.message}`
      })

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000)

    } catch (error) {
      console.error('Error enviando notificación de prueba:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error enviando la notificación de prueba'
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Configura tus preferencias de notificaciones</p>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-success-50 border border-success-200' 
            : 'bg-danger-50 border border-danger-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-success-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-danger-600" />
          )}
          <span className={`text-sm font-medium ${
            message.type === 'success' ? 'text-success-800' : 'text-danger-800'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      {/* Información del Usuario */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="input bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="input bg-gray-50 capitalize"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Contacto */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Información de Contacto
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de WhatsApp
            </label>
            <input
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                phone: formatPhoneInput(e.target.value) 
              }))}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: +54 9 [área] [número]. Ejemplo: +54 9 11 1234-5678
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de Notificaciones */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Preferencias de Notificaciones
        </h3>
        
        <div className="space-y-6">
          {/* WhatsApp */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="whatsapp"
              checked={profile.whatsappEnabled}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                whatsappEnabled: e.target.checked 
              }))}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="whatsapp" className="text-sm font-medium text-gray-900">
                Notificaciones por WhatsApp
              </label>
              <p className="text-xs text-gray-600">
                Recibe recordatorios diarios de tareas pendientes por WhatsApp
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="email"
              checked={profile.emailEnabled}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                emailEnabled: e.target.checked 
              }))}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                Notificaciones por Email
              </label>
              <p className="text-xs text-gray-600">
                Recibe recordatorios y actualizaciones por correo electrónico
              </p>
            </div>
          </div>

          {/* Horario de notificaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario de recordatorios diarios
            </label>
            <select
              value={profile.notificationTime}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                notificationTime: e.target.value 
              }))}
              className="select max-w-xs"
            >
              <option value="08:00">8:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="17:00">5:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hora en que recibirás recordatorios diarios de tareas pendientes
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        {/* Botón de Prueba */}
        <button
          onClick={handleTestNotification}
          disabled={testing || (!profile.whatsappEnabled && !profile.emailEnabled)}
          className="btn-secondary flex items-center justify-center"
          title={(!profile.whatsappEnabled && !profile.emailEnabled) ? 
            'Habilita al menos un método de notificación' : 
            'Enviar notificación de prueba'}
        >
          {testing ? (
            <LoadingSpinner size="small" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {testing ? 'Enviando...' : 'Probar Notificaciones'}
        </button>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center justify-center"
        >
          {saving ? (
            <LoadingSpinner size="small" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Sección de Demostración */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start space-x-3">
          <Send className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-900">
              🎯 Demostración del Sistema
            </h4>
            <p className="text-xs text-purple-800 mt-2 mb-3">
              Usa el botón "Probar Notificaciones" para ver cómo funcionan los recordatorios automáticos.
            </p>
            <div className="bg-white/50 rounded-lg p-3 text-xs text-purple-700">
              <p className="font-medium mb-1">La notificación de prueba incluye:</p>
              <ul className="space-y-1">
                <li>• 📚 3 tareas de ejemplo (Programación Web, Base de Datos, Metodologías Ágiles)</li>
                <li>• 📅 Fechas de vencimiento realistas</li>
                <li>• 📱 Mensaje formateado para WhatsApp</li>
                <li>• 📧 Email HTML con detalles completos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Sobre las Notificaciones Automáticas
            </h4>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>• Los recordatorios se envían automáticamente a la hora configurada</li>
              <li>• Solo se envían si tienes tareas pendientes (próximas a vencer en 7 días)</li>
              <li>• WhatsApp requiere que el administrador configure el servicio</li>
              <li>• Puedes cambiar estas preferencias en cualquier momento</li>
              <li>• Las notificaciones respetan tu zona horaria local</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
