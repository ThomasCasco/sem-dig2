# Guía de Configuración Rápida - Semillero Digital Dashboard

Esta guía te ayudará a configurar el proyecto en menos de 15 minutos.

## 🚀 Configuración Express (Para Desarrollo)

### 1. Prerrequisitos
- Node.js 16+ instalado
- Cuenta de Google (Gmail)
- 10 minutos de tiempo

### 2. Instalación Rápida

```bash
# Clonar e instalar
git clone <tu-repo>
cd semillero-dashboard
npm run install-all
```

### 3. Configurar Google Cloud (5 minutos)

#### Paso 1: Crear Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Clic en "Nuevo Proyecto"
3. Nombre: "Semillero Dashboard"
4. Crear

#### Paso 2: Habilitar APIs
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca y habilita:
   - **Google Classroom API**
   - **Google+ API** (para OAuth)

#### Paso 3: Crear Credenciales OAuth
1. Ve a "APIs y servicios" > "Credenciales"
2. Clic "Crear credenciales" > "ID de cliente OAuth 2.0"
3. Configurar pantalla de consentimiento:
   - Tipo: Externo
   - Nombre: "Semillero Dashboard"
   - Email de soporte: tu-email@gmail.com
   - Guardar
4. Crear ID de cliente OAuth:
   - Tipo: Aplicación web
   - Nombre: "Semillero Dashboard"
   - URIs de redirección: `http://localhost:3001/auth/callback`
   - Crear

#### Paso 4: Copiar Credenciales
- Copia el **ID de cliente** y **Secreto de cliente**

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus datos:

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=mi_secreto_super_seguro_123
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
COORDINATOR_EMAILS=tu-email@gmail.com
WHATSAPP_ENABLED=false
EMAIL_ENABLED=false
```

### 5. Ejecutar la Aplicación

```bash
npm run dev
```

¡Listo! Ve a http://localhost:5173

## 🎯 Configuración de Roles

### Coordinador
- Agrega tu email en `COORDINATOR_EMAILS`
- Tendrás acceso completo a reportes y métricas

### Profesor
- Crea un curso en Google Classroom
- Serás detectado automáticamente como profesor

### Alumno
- Únete a un curso como estudiante
- Tendrás vista de progreso personal

## 🔧 Solución de Problemas Comunes

### Error: "Invalid client"
```bash
# Verifica que copiaste bien las credenciales
echo $GOOGLE_CLIENT_ID
```

### Error: "Redirect URI mismatch"
- Asegúrate de que la URI en Google Cloud sea exactamente:
  `http://localhost:3001/auth/callback`

### No aparecen cursos
- Verifica que tengas cursos activos en Google Classroom
- Asegúrate de estar logueado con la cuenta correcta

### Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3002
```

## 📱 Funcionalidades por Rol

### 👨‍🎓 Alumno
- ✅ Ver mis cursos
- ✅ Progreso personal
- ✅ Tareas pendientes
- ✅ Estado de entregas

### 👨‍🏫 Profesor  
- ✅ Gestionar clases
- ✅ Ver estudiantes
- ✅ Monitorear entregas
- ✅ Métricas de curso

### 👨‍💼 Coordinador
- ✅ Vista global
- ✅ Reportes avanzados
- ✅ Métricas comparativas
- ✅ Exportar datos

## 🚀 Despliegue Rápido

### Frontend (Vercel)
1. Conecta tu repo a Vercel
2. Deploy automático

### Backend (Railway)
1. Conecta tu repo a Railway
2. Agrega variables de entorno
3. Deploy automático

## 📞 Ayuda Rápida

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Solo backend
cd backend && npm run dev

# Solo frontend  
cd frontend && npm run dev

# Linting
npm run lint

# Build producción
npm run build
```

### URLs Importantes
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/health
- Google Cloud: https://console.cloud.google.com

### Archivos Importantes
- `.env` - Variables de entorno
- `backend/server.js` - Servidor principal
- `frontend/src/App.jsx` - App principal
- `README.md` - Documentación completa

## ✅ Checklist de Configuración

- [ ] Node.js instalado
- [ ] Proyecto clonado
- [ ] Dependencias instaladas (`npm run install-all`)
- [ ] Google Cloud proyecto creado
- [ ] APIs habilitadas (Classroom + OAuth)
- [ ] Credenciales OAuth creadas
- [ ] Archivo `.env` configurado
- [ ] Aplicación ejecutándose (`npm run dev`)
- [ ] Login con Google funcionando
- [ ] Datos de cursos cargando

## 🎉 ¡Listo!

Si completaste todos los pasos, deberías tener:
- ✅ Dashboard funcionando
- ✅ Login con Google
- ✅ Datos de Google Classroom
- ✅ Vistas por rol
- ✅ Métricas y reportes

**¿Problemas?** Revisa la sección de solución de problemas o abre un issue en GitHub.

---

*Tiempo estimado de configuración: 10-15 minutos*
