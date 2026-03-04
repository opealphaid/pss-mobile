# Servicio de Notificaciones PSS Mobile

Servicio backend para gestionar notificaciones push con MongoDB y Expo.

## 🚀 Instalación

```bash
cd notification-service
npm install
```

## ▶️ Iniciar el Servidor

```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

El servidor correrá en `http://localhost:3001`

## 📱 Uso en la App

La app automáticamente registra el token cuando el usuario inicia sesión.

## 🧪 Probar Notificaciones

### Notificación Normal
1. Inicia la app móvil y haz login
2. Copia el `userId` de la consola
3. Ejecuta:

```bash
node test-send.js <userId>
```

Ejemplo:
```bash
node test-send.js 123
```

### 🚨 Notificación Urgente (con Linterna)
Para probar notificaciones con sonido continuo, vibración y linterna:

```bash
node test-urgent-flashlight.js
```

Esto enviará una notificación urgente al primer usuario registrado con:
- ✅ Sonido en loop continuo
- ✅ Vibración intensa cada 500ms
- ✅ **Linterna parpadeando cada 500ms**

### Panel Web
Abre `panel.html` en tu navegador para una interfaz gráfica:
```bash
start panel.html  # Windows
open panel.html   # macOS
```

## 🔌 Endpoints API

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
    alarm?: boolean,  // true para activar sonido continuo + vibración + linterna
    timestamp?: string
  }
}
```

**Ejemplo de notificación urgente:**
```json
{
  "userId": "123",
  "title": "🚨 ALERTA URGENTE",
  "body": "Ticket crítico requiere atención inmediata",
  "data": {
    "type": "urgent",
    "alarm": true,
    "ticketId": "456"
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

## 🔧 Integración con Backend Principal

Agrega estas rutas a tu backend principal en `pss.alphasys.com.bo/bck`:

### Notificación Normal
```javascript
// Ejemplo: Enviar notificación cuando se asigna un ticket
app.post('/tickets/assign', async (req, res) => {
  // ... lógica de asignación ...
  
  await fetch('http://localhost:3001/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: tecnicoId,
      title: 'Nuevo Ticket Asignado',
      body: `Ticket #${ticketId} requiere tu atención`,
      data: { ticketId, type: 'assignment' }
    })
  });
});
```

### Notificación Urgente (con Linterna)
```javascript
// Ejemplo: Ticket crítico con alarma y linterna
app.post('/tickets/urgent', async (req, res) => {
  // ... lógica ...
  
  await fetch('http://localhost:3001/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: tecnicoId,
      title: '🚨 ALERTA URGENTE',
      body: `Ticket crítico #${ticketId} - Atención inmediata`,
      data: { 
        ticketId, 
        type: 'urgent',
        alarm: true  // Activa sonido continuo + vibración + linterna
      }
    })
  });
});
```

## 🗄️ Base de Datos MongoDB

**Cluster:** ClusterAlphaNotifications  
**Base de Datos:** Clients

### Colecciones:

**pushTokens**
```json
{
  "userId": "123",
  "email": "user@example.com",
  "expoPushToken": "ExponentPushToken[...]",
  "deviceInfo": {
    "platform": "android",
    "model": "Pixel 6",
    "osVersion": "13"
  },
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**notifications**
```json
{
  "userId": "123",
  "title": "Nuevo Ticket",
  "body": "Ticket #456 asignado",
  "data": { "ticketId": 456 },
  "sent": true,
  "sentAt": "2024-01-15T10:30:00Z",
  "tickets": [...]
}
```

## 🌐 Despliegue en Producción

1. Actualiza la URL en `constants/api.ts`:
```typescript
export const PATH_NOTIFICATION_SERVICE = "https://tu-servidor.com";
```

2. Configura variables de entorno en producción
3. Usa PM2 o similar para mantener el servicio activo

## ✅ Verificación

- Health check: `http://localhost:3001/health`
- Verifica logs en consola del servidor
- Revisa MongoDB Atlas para ver tokens registrados
