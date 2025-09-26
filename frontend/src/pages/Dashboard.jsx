import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardAlumno from '../components/dashboard/DashboardAlumno'
import DashboardProfesor from '../components/dashboard/DashboardProfesor'
import DashboardCoordinador from '../components/dashboard/DashboardCoordinador'
import { AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get('/api/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setError(error.response?.data?.error || 'Error cargando los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-danger-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error cargando el dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  // Renderizar dashboard según el rol
  const renderDashboard = () => {
    switch (user?.role) {
      case 'alumno':
        return <DashboardAlumno data={dashboardData} onRefresh={handleRefresh} />
      case 'profesor':
        return <DashboardProfesor data={dashboardData} onRefresh={handleRefresh} />
      case 'coordinador':
        return <DashboardCoordinador data={dashboardData} onRefresh={handleRefresh} />
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Rol de usuario no reconocido</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.name}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            'Actualizar'
          )}
        </button>
      </div>

      {/* Dashboard content */}
      {renderDashboard()}
    </div>
  )
}

export default Dashboard
