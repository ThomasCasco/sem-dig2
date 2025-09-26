import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Filter
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

const Reports = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('all')

  useEffect(() => {
    // Verificar que el usuario sea coordinador
    if (user?.role !== 'coordinador') {
      setError('No tienes permisos para acceder a esta página')
      setLoading(false)
      return
    }

    fetchReportsData()
  }, [user])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener métricas globales
      const metricsResponse = await axios.get('/api/metrics')
      setMetrics(metricsResponse.data)

      // Obtener cursos
      const coursesResponse = await axios.get('/api/courses')
      setCourses(coursesResponse.data)

    } catch (error) {
      console.error('Error cargando reportes:', error)
      setError(error.response?.data?.error || 'Error cargando los reportes')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!metrics?.courseMetrics) return

    const headers = ['Curso', 'Estudiantes', 'Tareas', 'Entregas', '% A Tiempo']
    const rows = metrics.courseMetrics.map(course => [
      course.courseName,
      course.studentCount,
      course.assignmentCount,
      course.submissionCount,
      course.onTimePercentage
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_semillero_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            Error cargando reportes
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {user?.role === 'coordinador' && (
            <button
              onClick={fetchReportsData}
              className="btn-primary"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-600">
          No se encontraron métricas para generar reportes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Métricas</h1>
          <p className="text-gray-600">
            Análisis detallado del rendimiento académico
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
          <button
            onClick={fetchReportsData}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              className="select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">Todo el período</option>
              <option value="month">Último mes</option>
              <option value="week">Última semana</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <select
              className="select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Generales */}
      <MetricsOverview metrics={metrics} />

      {/* Gráficos */}
      <ChartsSection metrics={metrics} />

      {/* Tabla Detallada */}
      <DetailedTable metrics={metrics} />

      {/* Análisis y Recomendaciones */}
      <AnalysisSection metrics={metrics} />
    </div>
  )
}

const MetricsOverview = ({ metrics }) => {
  const stats = [
    {
      name: 'Total Cursos',
      value: metrics.totalCourses,
      icon: FileText,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Total Estudiantes',
      value: metrics.totalStudents,
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      name: 'Total Tareas',
      value: metrics.totalAssignments,
      icon: FileText,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      name: 'Entregas Totales',
      value: metrics.totalSubmissions,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: '% Entregas a Tiempo',
      value: `${metrics.globalOnTimePercentage}%`,
      icon: TrendingUp,
      color: metrics.globalOnTimePercentage >= 80 ? 'text-success-600' : 
             metrics.globalOnTimePercentage >= 60 ? 'text-warning-600' : 'text-danger-600',
      bgColor: metrics.globalOnTimePercentage >= 80 ? 'bg-success-100' : 
               metrics.globalOnTimePercentage >= 60 ? 'bg-warning-100' : 'bg-danger-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const ChartsSection = ({ metrics }) => {
  // Datos para gráfico de barras - Top 10 cursos por entregas
  const topCourses = metrics.courseMetrics
    .sort((a, b) => b.submissionCount - a.submissionCount)
    .slice(0, 10)

  const barChartData = {
    labels: topCourses.map(course => 
      course.courseName.length > 25 
        ? course.courseName.substring(0, 25) + '...' 
        : course.courseName
    ),
    datasets: [
      {
        label: 'Entregas Totales',
        data: topCourses.map(course => course.submissionCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Entregas a Tiempo',
        data: topCourses.map(course => 
          Math.round((course.onTimePercentage / 100) * course.submissionCount)
        ),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
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
        text: 'Top 10 Cursos por Entregas',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Datos para gráfico de dona - Distribución de rendimiento
  const excellentCourses = metrics.courseMetrics.filter(c => c.onTimePercentage >= 80).length
  const goodCourses = metrics.courseMetrics.filter(c => c.onTimePercentage >= 60 && c.onTimePercentage < 80).length
  const needsImprovementCourses = metrics.courseMetrics.filter(c => c.onTimePercentage < 60).length

  const doughnutData = {
    labels: ['Excelente (≥80%)', 'Bueno (60-79%)', 'Necesita Mejora (<60%)'],
    datasets: [
      {
        data: [excellentCourses, goodCourses, needsImprovementCourses],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
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
        text: 'Distribución de Rendimiento por Curso',
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="h-96">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
      
      <div className="card">
        <div className="h-96 flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  )
}

const DetailedTable = ({ metrics }) => {
  const [sortField, setSortField] = useState('submissionCount')
  const [sortDirection, setSortDirection] = useState('desc')

  const sortedCourses = [...metrics.courseMetrics].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Métricas Detalladas por Curso
        </h3>
        <span className="text-sm text-gray-600">
          {metrics.courseMetrics.length} cursos
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('courseName')}
              >
                Curso {getSortIcon('courseName')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('studentCount')}
              >
                Estudiantes {getSortIcon('studentCount')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignmentCount')}
              >
                Tareas {getSortIcon('assignmentCount')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submissionCount')}
              >
                Entregas {getSortIcon('submissionCount')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('onTimePercentage')}
              >
                % A Tiempo {getSortIcon('onTimePercentage')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rendimiento
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCourses.map((course) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.onTimePercentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.onTimePercentage >= 80 
                      ? 'bg-success-100 text-success-800'
                      : course.onTimePercentage >= 60
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-danger-100 text-danger-800'
                  }`}>
                    {course.onTimePercentage >= 80 ? 'Excelente' :
                     course.onTimePercentage >= 60 ? 'Bueno' : 'Necesita Mejora'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const AnalysisSection = ({ metrics }) => {
  const getRecommendations = () => {
    const recommendations = []
    
    // Análisis de rendimiento general
    if (metrics.globalOnTimePercentage < 70) {
      recommendations.push({
        type: 'warning',
        title: 'Rendimiento General Bajo',
        description: 'El porcentaje global de entregas a tiempo está por debajo del 70%. Considera implementar recordatorios automáticos y sesiones de apoyo.',
        priority: 'high'
      })
    }

    // Cursos con bajo rendimiento
    const lowPerformanceCourses = metrics.courseMetrics.filter(c => c.onTimePercentage < 50)
    if (lowPerformanceCourses.length > 0) {
      recommendations.push({
        type: 'danger',
        title: 'Cursos Críticos',
        description: `${lowPerformanceCourses.length} curso(s) tienen menos del 50% de entregas a tiempo. Requieren atención inmediata.`,
        priority: 'high',
        courses: lowPerformanceCourses.map(c => c.courseName)
      })
    }

    // Cursos con buen rendimiento
    const excellentCourses = metrics.courseMetrics.filter(c => c.onTimePercentage >= 90)
    if (excellentCourses.length > 0) {
      recommendations.push({
        type: 'success',
        title: 'Cursos Destacados',
        description: `${excellentCourses.length} curso(s) tienen más del 90% de entregas a tiempo. ¡Excelente trabajo!`,
        priority: 'low',
        courses: excellentCourses.map(c => c.courseName)
      })
    }

    return recommendations
  }

  const recommendations = getRecommendations()

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Análisis y Recomendaciones
      </h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            rec.type === 'success' ? 'bg-success-50 border-success-400' :
            rec.type === 'warning' ? 'bg-warning-50 border-warning-400' :
            rec.type === 'danger' ? 'bg-danger-50 border-danger-400' :
            'bg-gray-50 border-gray-400'
          }`}>
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className={`font-medium ${
                  rec.type === 'success' ? 'text-success-800' :
                  rec.type === 'warning' ? 'text-warning-800' :
                  rec.type === 'danger' ? 'text-danger-800' :
                  'text-gray-800'
                }`}>
                  {rec.title}
                </h4>
                <p className={`mt-1 text-sm ${
                  rec.type === 'success' ? 'text-success-700' :
                  rec.type === 'warning' ? 'text-warning-700' :
                  rec.type === 'danger' ? 'text-danger-700' :
                  'text-gray-700'
                }`}>
                  {rec.description}
                </p>
                {rec.courses && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Cursos afectados:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {rec.courses.slice(0, 5).map((course, i) => (
                        <li key={i}>{course}</li>
                      ))}
                      {rec.courses.length > 5 && (
                        <li>... y {rec.courses.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                rec.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                rec.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                'bg-success-100 text-success-800'
              }`}>
                {rec.priority === 'high' ? 'Alta' :
                 rec.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
            </div>
          </div>
        ))}
        
        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="mx-auto h-8 w-8 mb-2" />
            <p>No hay recomendaciones específicas en este momento.</p>
            <p className="text-sm">El rendimiento general está dentro de los parámetros esperados.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
