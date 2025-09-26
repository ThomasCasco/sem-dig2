import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Bell,
  Smartphone,
  BarChart3,
  ArrowRight,
  Play,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Globe
} from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: BookOpen,
      title: "Seguimiento Académico",
      description: "Monitorea el progreso de estudiantes en tiempo real con métricas detalladas",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bell,
      title: "Notificaciones Inteligentes",
      description: "Recordatorios automáticos por WhatsApp y email para no perder ninguna tarea",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Reportes Avanzados",
      description: "Análisis completos con gráficos interactivos y recomendaciones automáticas",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Gestión Colaborativa",
      description: "Coordinadores, profesores y estudiantes trabajando juntos eficientemente",
      color: "from-orange-500 to-red-500"
    }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Coordinadora Académica",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "Semillero Digital transformó completamente nuestra gestión educativa. Ahora podemos hacer seguimiento personalizado a cada estudiante."
    },
    {
      name: "Carlos Rodríguez",
      role: "Profesor de Programación",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "Las notificaciones automáticas han mejorado significativamente la entrega de tareas. Los estudiantes están más organizados."
    },
    {
      name: "Ana Martínez",
      role: "Estudiante",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "Me encanta recibir recordatorios de mis tareas. Ya no se me olvida ninguna fecha de entrega importante."
    }
  ]

  const stats = [
    { number: "500+", label: "Estudiantes Activos", icon: Users },
    { number: "50+", label: "Cursos Disponibles", icon: BookOpen },
    { number: "95%", label: "Entregas a Tiempo", icon: TrendingUp },
    { number: "24/7", label: "Monitoreo Continuo", icon: Bell }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 animate-pulse">
                  <Zap className="h-4 w-4 mr-2" />
                  Plataforma Educativa Innovadora
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  Semillero
                  <br />
                  <span className="text-4xl lg:text-6xl">Digital</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Transformamos la educación con tecnología inteligente. 
                  Seguimiento personalizado, notificaciones automáticas y 
                  análisis avanzados para potenciar el aprendizaje.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link 
                    to="/dashboard" 
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                <button className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                  alt="Estudiantes colaborando"
                  className="rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl -z-10"></div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-4 -right-8 w-12 h-12 bg-pink-400 rounded-full animate-pulse opacity-80"></div>
              <div className="absolute top-1/2 -left-12 w-8 h-8 bg-green-400 rounded-full animate-ping opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades que Marcan la Diferencia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo Semillero Digital revoluciona la gestión educativa con herramientas inteligentes y automatizadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de educadores y estudiantes que transformaron su experiencia
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src={testimonials[currentSlide].image}
                    alt={testimonials[currentSlide].name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl text-gray-700 italic mb-6">
                    "{testimonials[currentSlide].quote}"
                  </blockquote>
                  
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonials[currentSlide].name}
                    </div>
                    <div className="text-blue-600 font-medium">
                      {testimonials[currentSlide].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para Transformar tu Educación?
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Únete a cientos de educadores que ya están revolucionando 
              la forma de enseñar y aprender con Semillero Digital
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated && (
                <Link 
                  to="/login"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Comenzar Gratis
                </Link>
              )}
              
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300">
                <Heart className="mr-2 h-5 w-5" />
                Contactar Soporte
              </button>
            </div>

            <div className="mt-12 flex justify-center items-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                <span className="text-sm">Certificado de Calidad</span>
              </div>
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                <span className="text-sm">Resultados Garantizados</span>
              </div>
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                <span className="text-sm">Acceso Móvil</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-2xl font-bold">Semillero Digital</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transformando la educación a través de la tecnología. 
                Conectamos estudiantes, profesores y coordinadores en una experiencia de aprendizaje única.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 cursor-pointer transition-colors">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 cursor-pointer transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reportes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Notificaciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integración</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Semillero Digital. Todos los derechos reservados. Hecho con ❤️ para la educación.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
