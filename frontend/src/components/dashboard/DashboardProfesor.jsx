import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, Clock } from 'lucide-react'

const DashboardProfesor = ({ data }) => {
  const { courses = [], totalCourses = 0, totalStudents = 0, totalAssignments = 0 } = data || {}
  
  // Debug: Ver qué datos llegan
  console.log('DashboardProfesor data:', data)
  console.log('Courses:', courses)

  const stats = [
    {
      name: 'Mis Clases',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-primary-600'
    },
    {
      name: 'Total Estudiantes',
      value: totalStudents,
      icon: Users,
      color: 'text-success-600'
    },
    {
      name: 'Tareas Creadas',
      value: totalAssignments,
      icon: FileText,
      color: 'text-warning-600'
    },
    {
      name: 'Promedio por Clase',
      value: totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0,
      icon: Users,
      color: 'text-purple-600'
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
        {/* Mis Clases */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Mis Clases</h3>
            <Link to="/progreso" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todas
            </Link>
          </div>
          
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No tienes clases asignadas
              </p>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {course.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {course.section || 'Sin sección'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students || 0} estudiantes
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {course.assignments || 0} tareas
                      </span>
                    </div>
                    {course.id ? (
                      <Link 
                        to={`/curso/${course.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                        onClick={(e) => {
                          console.log('Navegando a curso:', course.id, course)
                        }}
                      >
                        Gestionar
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          console.log('Curso sin ID:', course)
                          alert('Este curso no tiene ID válido. Verifica la configuración.')
                        }}
                        className="text-gray-400 cursor-not-allowed font-medium"
                      >
                        Sin ID
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <Link to="/progreso" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todo
            </Link>
          </div>
          
          {/* Botón de prueba para verificar navegación */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">🧪 Prueba de navegación:</p>
            <Link 
              to="/progreso" 
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Ir a Progreso (Prueba)
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Clock className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nuevas entregas pendientes de revisión
                </p>
                <p className="text-xs text-gray-500">
                  Revisa las tareas entregadas por tus estudiantes
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Crear nueva tarea
                </p>
                <p className="text-xs text-gray-500">
                  Asigna nuevas tareas desde Google Classroom
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Monitorear progreso
                </p>
                <p className="text-xs text-gray-500">
                  Revisa el progreso de tus estudiantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Clases */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Clases</h3>
        
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tienes clases asignadas actualmente
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
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
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.section || 'Sin sección'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.students || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.assignments || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {course.id ? (
                        <Link
                          to={`/curso/${course.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          onClick={(e) => {
                            console.log('Ver detalles curso:', course.id, course)
                          }}
                        >
                          Ver detalles
                        </Link>
                      ) : (
                        <span className="text-gray-400">Sin ID</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardProfesor
