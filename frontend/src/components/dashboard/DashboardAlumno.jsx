import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import ProgressBar from '../ProgressBar'
import StatusBadge from '../StatusBadge'

const DashboardAlumno = ({ data }) => {
  const { courses = [], totalCourses = 0, averageProgress = 0 } = data || {}

  const getRecentAssignments = () => {
    const assignments = []
    courses.forEach(course => {
      if (course.progress?.assignments) {
        course.progress.assignments.forEach(assignment => {
          assignments.push({
            ...assignment,
            courseName: course.name,
            courseId: course.id
          })
        })
      }
    })
    
    // Ordenar por fecha de vencimiento más próxima
    return assignments
      .filter(a => a.dueDate)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate.year, a.dueDate.month - 1, a.dueDate.day)
        const dateB = new Date(b.dueDate.year, b.dueDate.month - 1, b.dueDate.day)
        return dateA - dateB
      })
      .slice(0, 5)
  }

  const recentAssignments = getRecentAssignments()

  const stats = [
    {
      name: 'Cursos Activos',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-primary-600'
    },
    {
      name: 'Progreso Promedio',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'text-success-600'
    },
    {
      name: 'Tareas Completadas',
      value: courses.reduce((sum, c) => sum + (c.progress?.completedAssignments || 0), 0),
      icon: CheckCircle,
      color: 'text-success-600'
    },
    {
      name: 'Tareas Pendientes',
      value: courses.reduce((sum, c) => sum + ((c.progress?.totalAssignments || 0) - (c.progress?.completedAssignments || 0)), 0),
      icon: Clock,
      color: 'text-warning-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis Cursos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Mis Cursos</h3>
            <Link to="/cursos" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No tienes cursos activos
              </p>
            ) : (
              courses.slice(0, 3).map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {course.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {course.progress?.percentage || 0}%
                    </span>
                  </div>
                  
                  <ProgressBar 
                    progress={course.progress?.percentage || 0}
                    className="mb-2"
                  />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {course.progress?.completedAssignments || 0} de {course.progress?.totalAssignments || 0} tareas
                    </span>
                    <Link 
                      to={`/cursos/${course.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Próximas Entregas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Próximas Entregas</h3>
            <Link to="/progreso" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentAssignments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay entregas próximas
              </p>
            ) : (
              recentAssignments.map((assignment) => {
                const dueDate = new Date(
                  assignment.dueDate.year,
                  assignment.dueDate.month - 1,
                  assignment.dueDate.day
                )
                const isOverdue = dueDate < new Date() && assignment.status !== 'entregado'
                
                return (
                  <div key={`${assignment.courseId}-${assignment.id}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {assignment.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {assignment.courseName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Vence: {dueDate.toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-danger-500" />
                      )}
                      <StatusBadge status={assignment.status} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Progreso General */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso General</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso promedio en todos los cursos</span>
          <span className="text-sm font-medium text-gray-900">{averageProgress}%</span>
        </div>
        <ProgressBar progress={averageProgress} size="large" />
        <p className="text-sm text-gray-600 mt-2">
          {averageProgress >= 80 ? '¡Excelente trabajo! Mantén el ritmo.' :
           averageProgress >= 60 ? 'Buen progreso, sigue así.' :
           averageProgress >= 40 ? 'Puedes mejorar, ¡no te rindas!' :
           'Necesitas ponerte al día con tus tareas.'}
        </p>
      </div>
    </div>
  )
}

export default DashboardAlumno
