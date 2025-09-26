import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Bell, 
  ArrowLeft,
  Shield,
  Zap,
  Heart,
  Star,
  BarChart3,
  CheckCircle
} from 'lucide-react'

const Login = () => {
  const { login, error } = useAuth()

  const features = [
    {
      icon: BookOpen,
      title: 'Seguimiento de Cursos',
      description: 'Visualiza todos tus cursos de Google Classroom en un solo lugar'
    },
    {
      icon: Users,
      title: 'Gestión de Estudiantes',
      description: 'Monitorea el progreso y participación de cada estudiante'
    },
    {
      icon: BarChart3,
      title: 'Métricas y Reportes',
      description: 'Obtén insights detallados sobre el rendimiento académico'
    },
    {
      icon: Bell,
      title: 'Notificaciones Automáticas',
      description: 'Recordatorios por WhatsApp y email para no perder tareas'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-ping"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-[calc(100vh-100px)]">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-4">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Semillero Digital
                  </h1>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">Plataforma líder</span>
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Dashboard inteligente para Google Classroom con seguimiento personalizado, 
                métricas avanzadas y notificaciones automáticas por WhatsApp.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="group flex items-start space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start space-x-6 pt-6">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                Seguro y Confiable
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Súper Rápido
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                Hecho con Amor
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido!
                </h2>
                <p className="text-gray-600">
                  Inicia sesión con tu cuenta de Google para acceder
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
                  Solo accedemos a la información necesaria de Google Classroom.
                </p>
              </div>

              {/* Mobile Features Preview */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">
                  ¿Qué puedes hacer con Semillero Digital?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700">{feature.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
