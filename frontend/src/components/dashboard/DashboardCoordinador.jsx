import { Link } from 'react-router-dom'
import { BookOpen, Users, FileText, TrendingUp, BarChart3 } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const DashboardCoordinador = ({ data }) => {
  const {
    totalCourses = 0,
    totalStudents = 0,
    totalAssignments = 0,
    totalSubmissions = 0,
    globalOnTimePercentage = 0,
    courseMetrics = []
  } = data || {}

  const stats = [
    {
      name: 'Total Cursos',
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
      name: 'Total Tareas',
      value: totalAssignments,
      icon: FileText,
      color: 'text-warning-600'
    },
    {
      name: 'Entregas a Tiempo',
      value: `${globalOnTimePercentage}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  // Datos para gráfico de barras - Entregas por curso
  const barChartData = {
    labels: courseMetrics.slice(0, 8).map(course => 
      course.courseName.length > 20 
        ? course.courseName.substring(0, 20) + '...' 
        : course.courseName
    ),
    datasets: [
      {
        label: 'Entregas',
        data: courseMetrics.slice(0, 8).map(course => course.submissionCount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Entregas por Curso',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Datos para gráfico de dona - Distribución de entregas a tiempo
  const onTimeSubmissions = Math.round((globalOnTimePercentage / 100) * totalSubmissions)
  const lateSubmissions = totalSubmissions - onTimeSubmissions

  const doughnutData = {
    labels: ['A Tiempo', 'Atrasadas'],
    datasets: [
      {
        data: [onTimeSubmissions, lateSubmissions],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Distribución de Entregas',
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Globales */}
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <div className="card">
          <div className="h-80">
            {courseMetrics.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Dona */}
        <div className="card">
          <div className="h-80 flex items-center justify-center">
            {totalSubmissions > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay entregas registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas por Curso */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Métricas por Curso</h3>
          <Link to="/reportes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver reporte completo
          </Link>
        </div>
        
        {courseMetrics.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay métricas disponibles
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tareas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entregas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % A Tiempo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseMetrics.slice(0, 10).map((course) => (
                  <tr key={course.courseId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {course.courseName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.studentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.assignmentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.submissionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.onTimePercentage >= 80 
                            ? 'bg-success-100 text-success-800'
                            : course.onTimePercentage >= 60
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}>
                          {course.onTimePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/cursos/${course.courseId}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/cursos" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Gestionar Cursos</h3>
              <p className="text-sm text-gray-600">Ver y administrar todos los cursos</p>
            </div>
          </div>
        </Link>

        <Link to="/progreso" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-success-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Monitorear Progreso</h3>
              <p className="text-sm text-gray-600">Revisar progreso de estudiantes</p>
            </div>
          </div>
        </Link>

        <Link to="/reportes" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Generar Reportes</h3>
              <p className="text-sm text-gray-600">Crear reportes detallados</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default DashboardCoordinador
