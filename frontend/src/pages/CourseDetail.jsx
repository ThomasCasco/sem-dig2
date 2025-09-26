import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import ProgressBar from '../components/ProgressBar'
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'

const CourseDetail = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [courseWork, setCourseWork] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener información del curso
      const coursesResponse = await axios.get('/api/courses')
      const courseData = coursesResponse.data.find(c => c.id === courseId)
      
      if (!courseData) {
        throw new Error('Curso no encontrado')
      }
      
      setCourse(courseData)

      // Obtener tareas del curso
      const courseWorkResponse = await axios.get(`/api/courses/${courseId}/coursework`)
      setCourseWork(courseWorkResponse.data)

      // Obtener estudiantes (solo para profesores y coordinadores)
      if (user?.role !== 'alumno') {
        try {
          const studentsResponse = await axios.get(`/api/courses/${courseId}/students`)
          setStudents(studentsResponse.data)
        } catch (error) {
          console.error('Error cargando estudiantes:', error)
        }
      }

    } catch (error) {
      console.error('Error cargando datos del curso:', error)
      setError(error.response?.data?.error || error.message || 'Error cargando el curso')
    } finally {
      setLoading(false)
    }
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
            Error cargando el curso
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/cursos" className="btn-primary">
            Volver a cursos
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: FileText },
    { id: 'assignments', name: 'Tareas', icon: CheckCircle },
    ...(user?.role !== 'alumno' ? [
      { id: 'students', name: 'Estudiantes', icon: Users }
    ] : [])
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/cursos" 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Información del curso */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {course?.name}
            </h1>
            
            {course?.section && (
              <p className="text-gray-600 mb-2">
                Sección: {course.section}
              </p>
            )}
            
            {course?.description && (
              <p className="text-gray-700 mb-4">
                {course.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course?.studentCount || 0} estudiantes
              </span>
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {courseWork.length} tareas
              </span>
              {course?.primaryTeacher && user?.role !== 'profesor' && (
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {course.primaryTeacher.name || course.primaryTeacher.email}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-3">
            {course?.alternateLink && (
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Classroom
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab 
            course={course} 
            courseWork={courseWork} 
            students={students}
            userRole={user?.role}
          />
        )}
        
        {activeTab === 'assignments' && (
          <AssignmentsTab 
            courseWork={courseWork} 
            courseId={courseId}
            userRole={user?.role}
          />
        )}
        
        {activeTab === 'students' && user?.role !== 'alumno' && (
          <StudentsTab 
            students={students} 
            courseId={courseId}
          />
        )}
      </div>
    </div>
  )
}

const OverviewTab = ({ course, courseWork, students, userRole }) => {
  const completedAssignments = courseWork.filter(assignment => {
    // Esta lógica se puede mejorar con datos reales de entregas
    return assignment.state === 'PUBLISHED'
  }).length

  const stats = [
    {
      name: 'Total Tareas',
      value: courseWork.length,
      icon: FileText,
      color: 'text-primary-600'
    },
    {
      name: 'Tareas Publicadas',
      value: courseWork.filter(a => a.state === 'PUBLISHED').length,
      icon: CheckCircle,
      color: 'text-success-600'
    },
    ...(userRole !== 'alumno' ? [{
      name: 'Estudiantes',
      value: students.length,
      icon: Users,
      color: 'text-purple-600'
    }] : [])
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tareas recientes */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tareas Recientes</h3>
        
        {courseWork.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay tareas en este curso
          </p>
        ) : (
          <div className="space-y-3">
            {courseWork.slice(0, 5).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {assignment.title}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Creado: {new Date(assignment.creationTime).toLocaleDateString('es-CO')}</span>
                    {assignment.dueDate && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Vence: {new Date(
                          assignment.dueDate.year,
                          assignment.dueDate.month - 1,
                          assignment.dueDate.day
                        ).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={assignment.state === 'PUBLISHED' ? 'entregado' : 'pendiente'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const AssignmentsTab = ({ courseWork, courseId, userRole }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Todas las Tareas ({courseWork.length})
        </h3>
      </div>

      {courseWork.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay tareas
          </h3>
          <p className="text-gray-600">
            Este curso no tiene tareas asignadas
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
                    Fecha de Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseWork.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.title}
                        </div>
                        {assignment.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {assignment.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.dueDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(
                            assignment.dueDate.year,
                            assignment.dueDate.month - 1,
                            assignment.dueDate.day
                          ).toLocaleDateString('es-CO')}
                        </div>
                      ) : (
                        <span className="text-gray-500">Sin fecha límite</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={assignment.state === 'PUBLISHED' ? 'entregado' : 'pendiente'} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.maxPoints || 'Sin puntos'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {assignment.alternateLink && (
                        <a
                          href={assignment.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ver en Classroom
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const StudentsTab = ({ students, courseId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Estudiantes ({students.length})
        </h3>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay estudiantes
          </h3>
          <p className="text-gray-600">
            Este curso no tiene estudiantes inscritos
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.profile?.photoUrl ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={student.profile.photoUrl}
                            alt={student.profile.name?.fullName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.profile?.name?.fullName || 'Sin nombre'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.profile?.emailAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/progreso?curso=${courseId}&estudiante=${student.userId}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver progreso
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetail
