# PSS Mobile - Sistema de Gestión de Tickets

Aplicación móvil desarrollada con Expo/React Native para la gestión de tickets de soporte técnico con sistema de notificaciones push en tiempo real.

## 📱 Características

- ✅ Gestión completa de tickets (crear, ver, actualizar)
- ✅ Sistema de notificaciones push con Expo
- ✅ Notificaciones urgentes con alarma, vibración y linterna
- ✅ Soporte multiidioma (Español/Inglés)
- ✅ Autenticación de usuarios
- ✅ Adjuntar archivos e imágenes
- ✅ Historial de notificaciones
- ✅ Navegación por pestañas

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npx expo start

# Compilar para Android
npx expo run:android

# Compilar para iOS
npx expo run:ios
```

## 🔔 Sistema de Notificaciones

### Arquitectura

El sistema de notificaciones consta de dos componentes principales:

1. **Servicio de Notificaciones** (`notification-service/`)
   - Servidor Node.js independiente
   - Base de datos MongoDB para tokens y historial
   - API REST para envío de notificaciones

2. **Integración con Backend** (`backend-integration/`)
   - Scripts para integrar con el backend principal
   - Ejemplos en JavaScript, PHP y Python

### Tipos de Notificaciones

#### 1. Notificación Normal
```javascript
{
  userId: "123",
  title: "Nuevo Ticket",
  body: "Ticket #456 asignado",
  data: {
    type: "new_ticket",
    ticketId: 456
  }
}
```

#### 2. Notificación Urgente 🚨
```javascript
{
  userId: "123",
  title: "🚨 ALERTA CRÍTICA",
  body: "Servidor principal caído",
  data: {
    type: "urgent",
    alarm: true,        // Alarma continua
    flashlight: true,   // Linterna parpadeante
    ticketId: 456
  }
}
```

**Características de notificaciones urgentes:**
- ✅ Sonido continuo en loop
- ✅ Vibración intensa cada 500ms
- ✅ Linterna parpadeando cada 500ms
- ✅ Suena incluso en modo silencio
- ✅ Solo se detiene al tocar la notificación

## 📡 Uso del Servicio de Notificaciones

### Iniciar el Servicio

```bash
cd notification-service
npm install
npm start
```

El servicio correrá en `http://localhost:3001`

### Enviar Notificación Directa

Usando el servicio de notificaciones directamente:

```javascript
const fetch = require('node-fetch');

// Notificación normal
await fetch('http://localhost:3001/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "123",
    title: "Nuevo Ticket",
    body: "Ticket #456 requiere atención",
    data: { ticketId: 456, type: "new_ticket" }
  })
});

// Notificación urgente con alarma
await fetch('http://localhost:3001/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: "123",
    title: "🚨 ALERTA URGENTE",
    body: "Problema crítico - Atención inmediata",
    data: { 
      ticketId: 456, 
      type: "urgent",
      alarm: true  // Activa alarma + vibración + linterna
    }
  })
});
```

### Probar Notificaciones

```bash
# Notificación normal
node test-send.js <userId>

# Notificación urgente con linterna
node test-urgent-flashlight.js

# Panel web de pruebas
start panel.html
```

## 🔌 Integración con Backend Principal

### Opción 1: Usar el Servicio de Notificaciones

Integra el servicio en tu backend principal (`pss.alphasys.com.bo/bck`):

```javascript
// En tu backend principal (Node.js)
const enviarNotificacion = async (userId, titulo, mensaje, data) => {
  await fetch('http://localhost:3001/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title: titulo,
      body: mensaje,
      data
    })
  });
};

// Ejemplo: Al asignar un ticket
app.post('/tickets/assign', async (req, res) => {
  // ... lógica de asignación ...
  
  await enviarNotificacion(
    tecnicoId,
    'Nuevo Ticket Asignado',
    `Ticket #${ticketId} requiere tu atención`,
    { ticketId, type: 'new_ticket' }
  );
});

// Ejemplo: Ticket crítico
app.post('/tickets/urgent', async (req, res) => {
  // ... lógica ...
  
  await enviarNotificacion(
    tecnicoId,
    '🚨 ALERTA CRÍTICA',
    `Ticket #${ticketId} - Atención inmediata`,
    { ticketId, type: 'urgent', alarm: true }
  );
});
```

### Opción 2: Envío Directo a Expo

Usa los scripts en `backend-integration/`:

**JavaScript/Node.js:**
```javascript
const { enviarNotificacion } = require('./backend-integration/enviar-notificacion.js');

await enviarNotificacion(
  expoPushToken,
  'Nuevo Ticket',
  'Ticket #456 asignado',
  { ticketId: 456 },
  'urgent-notifications'
);
```

**PHP:**
```php
require_once 'backend-integration/enviar-notificacion.php';

enviarNotificacion(
  $expoPushToken,
  'Nuevo Ticket',
  'Ticket #456 asignado',
  ['ticketId' => 456],
  'urgent-notifications'
);
```

**Python:**
```python
from backend_integration.enviar_notificacion import enviar_notificacion

enviar_notificacion(
  expo_push_token,
  'Nuevo Ticket',
  'Ticket #456 asignado',
  {'ticketId': 456},
  'urgent-notifications'
)
```

## 📋 Endpoints del Servicio

### Registrar Token
```
POST /api/notifications/register-token
Body: {
  userId: string,
  email: string,
  expoPushToken: string,
  deviceInfo: object
}
```

### Enviar Notificación
```
POST /api/notifications/send
Body: {
  userId: string,
  title: string,
  body: string,
  data?: {
    type?: string,
    ticketId?: string,
    alarm?: boolean,
    flashlight?: boolean
  }
}
```

### Enviar Notificaciones Masivas
```
POST /api/notifications/send-bulk
Body: {
  userIds: string[],
  title: string,
  body: string,
  data?: object
}
```

### Historial de Notificaciones
```
GET /api/notifications/history/:userId
```

## 🗄️ Base de Datos

**MongoDB Atlas**
- Cluster: ClusterAlphaNotifications
- Base de Datos: Clients

**Colecciones:**
- `pushTokens`: Tokens de dispositivos registrados
- `notifications`: Historial de notificaciones enviadas

## 🔧 Configuración

### Variables de Entorno

Crea `notification-service/.env`:
```env
MONGODB_URI=mongodb+srv://...
PORT=3001
```

### Configuración de la App

Edita `constants/api.ts`:
```typescript
export const PATH_URL_BACKEND = "https://pss.alphasys.com.bo/bck";
export const PATH_NOTIFICATION_SERVICE = "http://localhost:3001/api";
export const PATH_DOCUMENTS = "https://pss.alphasys.com.bo/bck";
```

## 📱 Canales de Notificación

- **default**: Notificaciones normales
- **urgent-notifications**: Notificaciones importantes
- **critical-alarm**: Alarmas críticas (sonido continuo + linterna)

## 🚨 Mejores Prácticas

### ✅ Hacer
- Usar `alarm: true` solo para emergencias reales
- Incluir `ticketId` en data para navegación
- Validar tokens antes de enviar
- Manejar errores de tokens inválidos

### ❌ No Hacer
- Abusar de notificaciones urgentes
- Enviar notificaciones sin contexto
- Ignorar errores de envío
- Enviar notificaciones duplicadas

## 📚 Documentación Adicional

- [Servicio de Notificaciones](./notification-service/README.md)
- [Tipos de Notificaciones](./backend-integration/tipos-notificaciones.md)
- [Integración con Backend](./backend-integration/)

## 🛠️ Tecnologías

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express
- **Base de Datos**: MongoDB Atlas
- **Notificaciones**: Expo Push Notifications
- **Navegación**: Expo Router
- **Estado**: AsyncStorage
