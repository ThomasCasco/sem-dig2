const { google } = require('googleapis')

// Emails de coordinadores (desde variables de entorno)
const COORDINATOR_EMAILS = process.env.COORDINATOR_EMAILS 
  ? process.env.COORDINATOR_EMAILS.split(',').map(email => email.trim())
  : []

/**
 * Determina el rol de un usuario basado en su participación en cursos
 */
async function getUserRole(auth, userEmail) {
  try {
    const classroom = google.classroom({ version: 'v1', auth })
    
    // Verificar si es coordinador (hardcoded en env)
    if (COORDINATOR_EMAILS.includes(userEmail)) {
      return 'coordinador'
    }

    // MODO DESARROLLO: Hacer que todos sean coordinadores para pruebas
    // Descomenta la siguiente línea para que todos tengan acceso completo
    // return 'coordinador'

    // Obtener todos los cursos
    const coursesResponse = await classroom.courses.list({
      teacherId: 'me',
      courseStates: ['ACTIVE']
    })

    const teacherCourses = coursesResponse.data.courses || []

    // Si es profesor de al menos un curso
    if (teacherCourses.length > 0) {
      return 'profesor'
    }

    // Por defecto, es alumno
    return 'alumno'
    
  } catch (error) {
    console.error('Error determinando rol de usuario:', error)
    return 'alumno' // Rol por defecto
  }
}

/**
 * Obtiene todos los cursos accesibles para el usuario
 */
async function getCourses(auth, userRole, userEmail) {
  try {
    const classroom = google.classroom({ version: 'v1', auth })
    let courses = []

    if (userRole === 'coordinador') {
      // Coordinador ve todos los cursos
      const response = await classroom.courses.list({
        courseStates: ['ACTIVE'],
        pageSize: 100
      })
      courses = response.data.courses || []
    } else if (userRole === 'profesor') {
      // Profesor ve sus cursos
      const response = await classroom.courses.list({
        teacherId: 'me',
        courseStates: ['ACTIVE']
      })
      courses = response.data.courses || []
    } else {
      // Alumno ve cursos donde está inscrito
      const response = await classroom.courses.list({
        studentId: 'me',
        courseStates: ['ACTIVE']
      })
      courses = response.data.courses || []
    }

    // Enriquecer con información adicional
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => {
        try {
          // Obtener número de estudiantes
          const studentsResponse = await classroom.courses.students.list({
            courseId: course.id
          })
          const studentCount = studentsResponse.data.students?.length || 0

          // Obtener información del profesor
          const teachersResponse = await classroom.courses.teachers.list({
            courseId: course.id
          })
          const teachers = teachersResponse.data.teachers || []
          const primaryTeacher = teachers.find(t => t.userId === course.ownerId) || teachers[0]

          return {
            ...course,
            studentCount,
            primaryTeacher: primaryTeacher ? {
              name: primaryTeacher.profile?.name?.fullName,
              email: primaryTeacher.profile?.emailAddress
            } : null
          }
        } catch (error) {
          console.error(`Error enriqueciendo curso ${course.id}:`, error)
          return course
        }
      })
    )

    return enrichedCourses
  } catch (error) {
    console.error('Error obteniendo cursos:', error)
    throw new Error('No se pudieron obtener los cursos')
  }
}

/**
 * Obtiene las tareas de un curso específico
 */
async function getCourseWork(auth, courseId) {
  try {
    const classroom = google.classroom({ version: 'v1', auth })
    
    const response = await classroom.courses.courseWork.list({
      courseId,
      courseWorkStates: ['PUBLISHED'],
      orderBy: 'dueDate desc'
    })

    return response.data.courseWork || []
  } catch (error) {
    console.error(`Error obteniendo tareas del curso ${courseId}:`, error)
    throw new Error('No se pudieron obtener las tareas')
  }
}

/**
 * Obtiene las entregas de una tarea específica
 */
async function getSubmissions(auth, courseId, courseWorkId) {
  try {
    const classroom = google.classroom({ version: 'v1', auth })
    
    const response = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId,
      states: ['NEW', 'CREATED', 'TURNED_IN', 'RETURNED', 'RECLAIMED_BY_STUDENT']
    })

    return response.data.studentSubmissions || []
  } catch (error) {
    console.error(`Error obteniendo entregas de ${courseWorkId}:`, error)
    throw new Error('No se pudieron obtener las entregas')
  }
}

/**
 * Obtiene estudiantes de un curso
 */
async function getCourseStudents(auth, courseId) {
  try {
    const classroom = google.classroom({ version: 'v1', auth })
    
    const response = await classroom.courses.students.list({
      courseId
    })

    return response.data.students || []
  } catch (error) {
    console.error(`Error obteniendo estudiantes del curso ${courseId}:`, error)
    throw new Error('No se pudieron obtener los estudiantes')
  }
}

/**
 * Calcula el progreso de un estudiante en un curso
 */
async function getStudentProgress(auth, courseId, studentId) {
  try {
    const courseWork = await getCourseWork(auth, courseId)
    
    if (courseWork.length === 0) {
      return {
        totalAssignments: 0,
        completedAssignments: 0,
        percentage: 0,
        assignments: []
      }
    }

    const assignmentProgress = await Promise.all(
      courseWork.map(async (assignment) => {
        try {
          const submissions = await getSubmissions(auth, courseId, assignment.id)
          const studentSubmission = submissions.find(s => s.userId === studentId)
          
          const status = getSubmissionStatus(assignment, studentSubmission)
          
          return {
            id: assignment.id,
            title: assignment.title,
            dueDate: assignment.dueDate,
            status,
            submission: studentSubmission
          }
        } catch (error) {
          console.error(`Error procesando tarea ${assignment.id}:`, error)
          return {
            id: assignment.id,
            title: assignment.title,
            dueDate: assignment.dueDate,
            status: 'error'
          }
        }
      })
    )

    const completedAssignments = assignmentProgress.filter(
      a => a.status === 'entregado'
    ).length

    return {
      totalAssignments: courseWork.length,
      completedAssignments,
      percentage: Math.round((completedAssignments / courseWork.length) * 100),
      assignments: assignmentProgress
    }
  } catch (error) {
    console.error(`Error calculando progreso del estudiante ${studentId}:`, error)
    throw new Error('No se pudo calcular el progreso')
  }
}

/**
 * Determina el estado de una entrega
 */
function getSubmissionStatus(assignment, submission) {
  if (!submission) {
    return 'faltante'
  }

  const now = new Date()
  const dueDate = assignment.dueDate ? new Date(
    assignment.dueDate.year,
    assignment.dueDate.month - 1,
    assignment.dueDate.day,
    assignment.dueTime?.hours || 23,
    assignment.dueTime?.minutes || 59
  ) : null

  switch (submission.state) {
    case 'TURNED_IN':
    case 'RETURNED':
      return 'entregado'
    case 'RECLAIMED_BY_STUDENT':
      return 'reentrega'
    case 'NEW':
    case 'CREATED':
      if (dueDate && now > dueDate) {
        return 'atrasado'
      }
      return 'pendiente'
    default:
      return 'desconocido'
  }
}

/**
 * Obtiene resumen de métricas para coordinadores
 */
async function getGlobalMetrics(auth) {
  try {
    const courses = await getCourses(auth, 'coordinador')
    
    let totalStudents = 0
    let totalAssignments = 0
    let totalSubmissions = 0
    let onTimeSubmissions = 0

    const courseMetrics = await Promise.all(
      courses.map(async (course) => {
        try {
          const students = await getCourseStudents(auth, course.id)
          const courseWork = await getCourseWork(auth, course.id)
          
          let courseSubmissions = 0
          let courseOnTime = 0

          for (const assignment of courseWork) {
            const submissions = await getSubmissions(auth, course.id, assignment.id)
            courseSubmissions += submissions.filter(s => s.state === 'TURNED_IN').length
            
            // Calcular entregas a tiempo
            const dueDate = assignment.dueDate ? new Date(
              assignment.dueDate.year,
              assignment.dueDate.month - 1,
              assignment.dueDate.day
            ) : null

            if (dueDate) {
              courseOnTime += submissions.filter(s => {
                if (s.state !== 'TURNED_IN') return false
                const turnedInDate = new Date(s.updateTime)
                return turnedInDate <= dueDate
              }).length
            }
          }

          totalStudents += students.length
          totalAssignments += courseWork.length
          totalSubmissions += courseSubmissions
          onTimeSubmissions += courseOnTime

          return {
            courseId: course.id,
            courseName: course.name,
            studentCount: students.length,
            assignmentCount: courseWork.length,
            submissionCount: courseSubmissions,
            onTimePercentage: courseSubmissions > 0 
              ? Math.round((courseOnTime / courseSubmissions) * 100) 
              : 0
          }
        } catch (error) {
          console.error(`Error procesando métricas del curso ${course.id}:`, error)
          return {
            courseId: course.id,
            courseName: course.name,
            studentCount: 0,
            assignmentCount: 0,
            submissionCount: 0,
            onTimePercentage: 0
          }
        }
      })
    )

    return {
      totalCourses: courses.length,
      totalStudents,
      totalAssignments,
      totalSubmissions,
      globalOnTimePercentage: totalSubmissions > 0 
        ? Math.round((onTimeSubmissions / totalSubmissions) * 100) 
        : 0,
      courseMetrics
    }
  } catch (error) {
    console.error('Error obteniendo métricas globales:', error)
    throw new Error('No se pudieron obtener las métricas')
  }
}

module.exports = {
  getUserRole,
  getCourses,
  getCourseWork,
  getSubmissions,
  getCourseStudents,
  getStudentProgress,
  getSubmissionStatus,
  getGlobalMetrics
}
