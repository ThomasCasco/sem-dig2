import { createContext, useContext, useState, useEffect } from 'react'
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

  // Configurar axios para incluir cookies y base URL
  axios.defaults.withCredentials = true
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  useEffect(() => {
    checkAuthStatus()
    
    // Verificar parámetros de URL para manejar redirects de OAuth
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const authError = urlParams.get('error')
    
    if (authStatus === 'success') {
      // Limpiar URL y recargar datos del usuario
      window.history.replaceState({}, document.title, window.location.pathname)
      checkAuthStatus()
    } else if (authError) {
      setError(getErrorMessage(authError))
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/auth/me')
      setUser(response.data)
      setError(null)
    } catch (error) {
      setUser(null)
      if (error.response?.status !== 401) {
        console.error('Error verificando autenticación:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
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
