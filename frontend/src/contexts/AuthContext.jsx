import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Configurar axios para incluir cookies y base URL
  axios.defaults.withCredentials = true
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  useEffect(() => {
    checkAuthStatus()
    
    // Verificar parámetros de URL para manejar redirects de OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const authError = urlParams.get('error')
    const userToken = urlParams.get('user')
    
    if (authStatus === 'success') {
      console.log('🎉 Autenticación exitosa detectada')
      
      // Si hay token temporal, usarlo como fallback
      if (userToken) {
        try {
          const userData = JSON.parse(atob(decodeURIComponent(userToken)))
          console.log('📦 Datos de usuario desde URL:', userData)
          setUser(userData)
          setError(null)
          
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // Redirigir al dashboard
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard')
          }
          return
        } catch (e) {
          console.error('Error parseando token temporal:', e)
        }
      }
      
      // Limpiar URL y recargar datos del usuario (método normal)
      window.history.replaceState({}, document.title, window.location.pathname)
      checkAuthStatus().then((userData) => {
        if (userData) {
          // Redirigir al dashboard después de autenticarse
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard')
          }
        }
      })
    } else if (authError) {
      setError(getErrorMessage(authError))
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      console.log('🔍 Verificando estado de autenticación...')
      const response = await axios.get('/auth/me')
      console.log('✅ Usuario autenticado:', response.data)
      setUser(response.data)
      setError(null)
      return response.data
    } catch (error) {
      console.log('❌ No autenticado:', error.response?.status)
      setUser(null)
      if (error.response?.status !== 401) {
        console.error('Error verificando autenticación:', error)
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    console.log('🚀 Iniciando login con Google:', `${apiUrl}/auth/google`)
    window.location.href = `${apiUrl}/auth/google`
  }

  const logout = async () => {
    try {
      await axios.post('/auth/logout')
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'no_code': 'No se recibió código de autorización de Google',
      'auth_failed': 'Error en la autenticación con Google',
      'access_denied': 'Acceso denegado por el usuario'
    }
    return errorMessages[errorCode] || 'Error de autenticación desconocido'
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user,
    isAlumno: user?.role === 'alumno',
    isProfesor: user?.role === 'profesor',
    isCoordinador: user?.role === 'coordinador'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
