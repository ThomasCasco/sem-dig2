# Semillero Digital - Dashboard para Google Classroom

Dashboard web complementario para Google Classroom diseñado para ONGs educativas. Permite el seguimiento del progreso de estudiantes, mejor comunicación y métricas ágiles de asistencia, participación y entregas.

## 🚀 Características Principales

### MVP (Funcionalidades Básicas)
- ✅ **Conexión con Google Classroom API** - Integración completa con Google Classroom v1
- ✅ **Autenticación OAuth 2.0** - Login seguro con cuentas de Google
- ✅ **Roles diferenciados** - Vistas específicas para Alumnos, Profesores y Coordinadores
- ✅ **Dashboard interactivo** - Métricas y progreso en tiempo real
- ✅ **Sistema de filtros** - Por cohorte, profesor, estado de entrega
- ✅ **Seguimiento de entregas** - Estados: entregado, atrasado, pendiente, faltante

### Funcionalidades Opcionales
- ✅ **Notificaciones WhatsApp** - Alertas automáticas via WhatsApp Web
- ✅ **Reportes gráficos** - Visualizaciones con Chart.js
- ✅ **Métricas avanzadas** - Análisis de rendimiento y recomendaciones
- ✅ **Exportación de datos** - Reportes en formato CSV

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** - Servidor web
- **Google APIs** - Integración con Classroom
- **Express Session** - Manejo de sesiones
- **WhatsApp Web.js** - Notificaciones (opcional)
- **Nodemailer** - Emails (opcional)

### Frontend
- **React 18** + **Vite** - Interfaz de usuario
- **Tailwind CSS** - Estilos y diseño
- **Chart.js** - Gráficos y visualizaciones
- **Axios** - Cliente HTTP
- **React Router** - Navegación

### Herramientas de Desarrollo
- **ESLint** + **Prettier** - Calidad de código
- **Concurrently** - Desarrollo simultáneo
- **Nodemon** - Recarga automática

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. **Cuenta de Google Cloud Platform**
4. **Proyecto en Google Cloud Console** con APIs habilitadas

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/semillero-dashboard.git
cd semillero-dashboard
```

### 2. Instalar Dependencias
```bash
npm run install-all
```

### 3. Configurar Google Cloud Console

#### 3.1 Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Classroom API
   - Google OAuth2 API

#### 3.2 Configurar OAuth 2.0
1. Ve a **APIs y servicios** > **Credenciales**
2. Crea credenciales > **ID de cliente de OAuth 2.0**
3. Tipo de aplicación: **Aplicación web**
4. URIs de redirección autorizados:
   - `http://localhost:3001/auth/callback` (desarrollo)
   - `https://tu-dominio.com/auth/callback` (producción)

#### 3.3 Obtener Credenciales
- Copia el **Client ID** y **Client Secret**

### 4. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# Session Configuration
SESSION_SECRET=tu_session_secret_seguro_aqui

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Coordinador Emails (separados por comas)
COORDINATOR_EMAILS=coordinador1@semillerodigital.org,coordinador2@semillerodigital.org

# WhatsApp Configuration (Opcional)
WHATSAPP_ENABLED=false

# Email Configuration (Opcional)
EMAIL_ENABLED=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

## 🚀 Ejecutar la Aplicación

### Desarrollo (Recomendado)
```bash
npm run dev
```
Esto ejecuta tanto el backend (puerto 3001) como el frontend (puerto 5173) simultáneamente.

### Producción
```bash
# Construir frontend
npm run build

# Ejecutar servidor
npm start
```

## 📱 Acceso a la Aplicación

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:3001
3. **Health Check**: http://localhost:3001/health

## 👥 Roles y Permisos

### 🎓 Alumno
- Ver sus cursos inscritos
- Seguimiento de progreso personal
- Estado de tareas y entregas
- Próximas fechas de vencimiento

### 👨‍🏫 Profesor
- Gestionar sus clases
- Ver estudiantes por curso
- Monitorear entregas y progreso
- Acceso a métricas de sus cursos

### 👨‍💼 Coordinador
- Vista global de todos los cursos
- Métricas y reportes avanzados
- Gestión de usuarios y permisos
- Exportación de datos
- Análisis y recomendaciones

## 🔧 Funcionalidades Detalladas

### Dashboard Interactivo
- **Métricas en tiempo real**: Progreso, entregas, asistencia
- **Gráficos dinámicos**: Barras, donas, líneas de tiempo
- **Filtros avanzados**: Por curso, profesor, estado, fecha
- **Responsive design**: Compatible con móviles y tablets

### Sistema de Notificaciones
- **WhatsApp Web**: Notificaciones automáticas (opcional)
- **Email**: Recordatorios y alertas (opcional)
- **Triggers**: Nuevas tareas, fechas límite, entregas atrasadas

### Reportes y Análisis
- **Exportación CSV**: Datos completos para análisis externo
- **Métricas de rendimiento**: Porcentajes de entrega a tiempo
- **Recomendaciones automáticas**: Basadas en patrones de datos
- **Comparativas**: Entre cursos, profesores, períodos

## 🔒 Seguridad

- **OAuth 2.0**: Autenticación segura con Google
- **Sesiones HTTP**: Manejo seguro de tokens
- **Rate Limiting**: Protección contra ataques
- **Helmet.js**: Headers de seguridad
- **CORS**: Configuración de dominios permitidos

## 🚀 Despliegue

### Vercel (Frontend)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático desde main branch

### Railway/Render (Backend)
1. Conecta tu repositorio
2. Configura variables de entorno
3. Deploy automático

### Variables de Entorno para Producción
```env
NODE_ENV=production
GOOGLE_CLIENT_ID=tu_client_id_produccion
GOOGLE_CLIENT_SECRET=tu_client_secret_produccion
GOOGLE_REDIRECT_URI=https://tu-dominio.com/auth/callback
FRONTEND_URL=https://tu-frontend.vercel.app
SESSION_SECRET=session_secret_muy_seguro
```

## 🧪 Testing

```bash
# Linting
npm run lint

# Fix automático
npm run lint:fix
```

## 📁 Estructura del Proyecto

```
semillero-dashboard/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Autenticación OAuth
│   │   └── api.js           # APIs de datos
│   ├── services/
│   │   ├── classroom.js     # Lógica de Google Classroom
│   │   └── whatsapp.js      # Notificaciones WhatsApp
│   ├── server.js            # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── contexts/       # Context API (Auth)
│   │   └── App.jsx         # Componente principal
│   ├── public/
│   └── package.json
├── .env.example            # Plantilla de variables
├── .gitignore
├── package.json           # Scripts principales
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

### Próximas Funcionalidades
- [ ] **Módulo de Asistencia** - Integración con Google Calendar
- [ ] **Notificaciones Push** - Notificaciones web nativas
- [ ] **Modo Offline** - Funcionalidad básica sin conexión
- [ ] **API REST Pública** - Para integraciones externas
- [ ] **Roles Personalizados** - Sistema de permisos granular
- [ ] **Temas Personalizables** - Dark mode y temas institucionales

### Mejoras Técnicas
- [ ] **Tests Unitarios** - Jest + React Testing Library
- [ ] **Base de Datos** - PostgreSQL para persistencia
- [ ] **Cache Redis** - Optimización de rendimiento
- [ ] **Docker** - Containerización completa
- [ ] **CI/CD** - GitHub Actions
- [ ] **Monitoring** - Logs y métricas de aplicación

## 🐛 Solución de Problemas

### Error: "Invalid client"
- Verifica que el `GOOGLE_CLIENT_ID` sea correcto
- Asegúrate de que la URL de callback esté configurada en Google Cloud Console

### Error: "Scope not authorized"
- Revisa que todos los scopes estén habilitados en Google Cloud Console
- Intenta revocar y volver a autorizar la aplicación

### WhatsApp no se conecta
- Asegúrate de que `WHATSAPP_ENABLED=true`
- Escanea el código QR que aparece en la consola
- Verifica que no haya otras sesiones de WhatsApp Web activas

### Problemas de CORS
- Verifica que `FRONTEND_URL` esté configurado correctamente
- En desarrollo, debe ser `http://localhost:5173`

## 📞 Soporte

- **Email**: soporte@semillerodigital.org
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/semillero-dashboard/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/semillero-dashboard/wiki)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Google Classroom API** - Por proporcionar acceso a los datos educativos
- **React Community** - Por las herramientas y librerías
- **Tailwind CSS** - Por el sistema de diseño
- **Semillero Digital** - Por la oportunidad de crear esta herramienta

---

**Desarrollado con ❤️ para la educación digital**

*Semillero Digital - Transformando vidas a través de la tecnología*
