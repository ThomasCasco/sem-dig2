import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import { 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  Download
} from 'lucide-react'

const Progress = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    cohorte: searchParams.get('curso') || '',
    profesor: '',
    estado: '',
    estudiante: searchParams.get('estudiante') || ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (courses.length > 0) {
      fetchSubmissions()
    }
  }, [filters, courses])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const coursesResponse = await axios.get('/api/courses')
      setCourses(coursesResponse.data)
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
      setError(error.response?.data?.error || 'Error cargando los datos')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams()
      
      if (filters.cohorte) params.append('cohorte', filters.cohorte)
      if (filters.profesor) params.append('profesor', filters.profesor)
      if (filters.estado) params.append('estado', filters.estado)
      
      const response = await axios.get(`/api/submissions?${params.toString()}`)
      setSubmissions(response.data)
    } catch (error) {
      console.error('Error cargando entregas:', error)
      setError(error.response?.data?.error || 'Error cargando las entregas')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      submission.assignmentTitle?.toLowerCase().includes(searchLower) ||
      submission.courseName?.toLowerCase().includes(searchLower) ||
      submission.userId?.toLowerCase().includes(searchLower)
    )
  })

  const getUniqueTeachers = () => {
    const teachers = new Set()
    courses.forEach(course => {
      if (course.primaryTeacher?.email) {
        teachers.add(course.primaryTeacher.email)
      }
    })
    return Array.from(teachers)
  }

  const getProgressStats = () => {
    const total = filteredSubmissions.length
    const entregado = filteredSubmissions.filter(s => s.status === 'entregado').length
    const atrasado = filteredSubmissions.filter(s => s.status === 'atrasado').length
    const pendiente = filteredSubmissions.filter(s => s.status === 'pendiente').length
    const faltante = filteredSubmissions.filter(s => s.status === 'faltante').length

    return { total, entregado, atrasado, pendiente, faltante }
  }

  const stats = getProgressStats()

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
            Error cargando el progreso
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="btn-primary"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'alumno' ? 'Mi Progreso' : 'Progreso de Estudiantes'}
          </h1>
          <p className="text-gray-600">
            {stats.total} {stats.total === 1 ? 'entrega' : 'entregas'} encontradas
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="btn-secondary mt-4 sm:mt-0"
        >
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">{stats.entregado}</div>
          <div className="text-sm text-gray-600">Entregadas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">{stats.pendiente}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-danger-600">{stats.atrasado}</div>
          <div className="text-sm text-gray-600">Atrasadas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.faltante}</div>
          <div className="text-sm text-gray-600">Faltantes</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Filtro por curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              className="select"
              value={filters.cohorte}
              onChange={(e) => handleFilterChange('cohorte', e.target.value)}
            >
              <option value="">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por profesor (solo coordinadores) */}
          {user?.role === 'coordinador' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesor
              </label>
              <select
                className="select"
                value={filters.profesor}
                onChange={(e) => handleFilterChange('profesor', e.target.value)}
              >
                <option value="">Todos los profesores</option>
                {getUniqueTeachers().map(email => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="select"
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="entregado">Entregado</option>
              <option value="pendiente">Pendiente</option>
              <option value="atrasado">Atrasado</option>
              <option value="faltante">Faltante</option>
              <option value="reentrega">Reentrega</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setFilters({ cohorte: '', profesor: '', estado: '', estudiante: '' })
              setSearchTerm('')
            }}
            className="btn-secondary text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista de entregas */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron entregas
          </h3>
          <p className="text-gray-600">
            {Object.values(filters).some(f => f) || searchTerm
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay entregas disponibles'
            }
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  {user?.role !== 'alumno' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission, index) => {
                  const dueDate = submission.dueDate ? new Date(
                    submission.dueDate.year,
                    submission.dueDate.month - 1,
                    submission.dueDate.day
                  ) : null

                  return (
                    <tr key={`${submission.courseId}-${submission.assignmentId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.assignmentTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {submission.assignmentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.courseName}
                        </div>
                      </td>
                      {user?.role !== 'alumno' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {submission.userId || 'Desconocido'}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dueDate ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {dueDate.toLocaleDateString('es-CO')}
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin fecha límite</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {submission.alternateLink && (
                            <a
                              href={submission.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Ver en Classroom
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progreso general (solo para alumnos) */}
      {user?.role === 'alumno' && courses.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso por Curso</h3>
          <div className="space-y-4">
            {courses.map(course => {
              const courseSubmissions = filteredSubmissions.filter(s => s.courseId === course.id)
              const completed = courseSubmissions.filter(s => s.status === 'entregado').length
              const total = courseSubmissions.length
              const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {course.name}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {completed} de {total} tareas ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar progress={percentage} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Progress
