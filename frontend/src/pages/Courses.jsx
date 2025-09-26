import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import { BookOpen, Users, FileText, Search, Filter, AlertCircle } from 'lucide-react'

const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get('/api/courses')
      setCourses(response.data)
    } catch (error) {
      console.error('Error cargando cursos:', error)
      setError(error.response?.data?.error || 'Error cargando los cursos')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.primaryTeacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterBy === 'all') return matchesSearch
    if (filterBy === 'active') return matchesSearch && course.courseState === 'ACTIVE'
    if (filterBy === 'large') return matchesSearch && course.studentCount > 20
    if (filterBy === 'small') return matchesSearch && course.studentCount <= 20
    
    return matchesSearch
  })

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
            Error cargando cursos
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
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
            {user?.role === 'alumno' ? 'Mis Cursos' : 
             user?.role === 'profesor' ? 'Mis Clases' : 
             'Todos los Cursos'}
          </h1>
          <p className="text-gray-600">
            {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} encontrados
          </p>
        </div>
        <button
          onClick={fetchCourses}
          className="btn-secondary mt-4 sm:mt-0"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="small" /> : 'Actualizar'}
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="select"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="large">Clases grandes (20+)</option>
              <option value="small">Clases pequeñas (-20)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterBy !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No tienes cursos asignados actualmente'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CourseCard = ({ course, userRole }) => {
  const getStatusColor = (state) => {
    switch (state) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      case 'PROVISIONED':
        return 'bg-warning-100 text-warning-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (state) => {
    switch (state) {
      case 'ACTIVE':
        return 'Activo'
      case 'ARCHIVED':
        return 'Archivado'
      case 'PROVISIONED':
        return 'Provisional'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {course.name}
          </h3>
          {course.section && (
            <p className="text-sm text-gray-600 truncate">
              Sección: {course.section}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.courseState)}`}>
          {getStatusLabel(course.courseState)}
        </span>
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.studentCount || 0}
          </span>
          {userRole !== 'alumno' && (
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Tareas
            </span>
          )}
        </div>
      </div>

      {course.primaryTeacher && userRole !== 'profesor' && (
        <div className="border-t pt-3 mb-4">
          <p className="text-xs text-gray-500">Profesor</p>
          <p className="text-sm font-medium text-gray-900">
            {course.primaryTeacher.name || course.primaryTeacher.email}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/cursos/${course.id}`}
          className="btn-primary text-sm"
        >
          {userRole === 'alumno' ? 'Ver curso' : 
           userRole === 'profesor' ? 'Gestionar' : 
           'Ver detalles'}
        </Link>
        
        {course.alternateLink && (
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Abrir en Classroom
          </a>
        )}
      </div>
    </div>
  )
}

export default Courses
