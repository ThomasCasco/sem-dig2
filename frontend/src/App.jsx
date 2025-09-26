import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import CourseDetail from './pages/CourseDetail'
import Progress from './pages/Progress'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/reportes" element={
              <Layout>
                <Reports />
              </Layout>
            } />
            <Route path="/perfil" element={
              <Layout>
                <Profile />
              </Layout>
            } />
            <Route path="/curso/:courseId" element={
              <Layout>
                <CourseDetail />
              </Layout>
            } />
            <Route path="/progreso" element={
              <Layout>
                <Progress />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </ErrorBoundary>
  )
}

export default App
