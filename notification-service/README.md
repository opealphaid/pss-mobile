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
  data?: object
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

```javascript
// Ejemplo: Enviar notificación cuando se asigna un ticket
app.post('/tickets/assign', async (req, res) => {
  // ... lógica de asignación ...
  
  // Enviar notificación
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
