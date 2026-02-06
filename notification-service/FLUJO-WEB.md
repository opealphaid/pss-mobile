# 🌐 Flujo de Notificaciones desde la Web

## 📋 Flujo Completo

1. **Cliente inicia sesión en la app móvil** → Token se guarda automáticamente en MongoDB
2. **Desde tu página web** → Envías notificación usando el panel o API
3. **Cliente recibe notificación** → En su dispositivo móvil (iOS/Android)

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor
```bash
cd notification-service
npm install
npm start
```

### 2. Abrir el Panel Web
Abre en tu navegador:
```
notification-service/panel.html
```

O el simple:
```
notification-service/web-sender.html
```

### 3. Cliente Inicia Sesión en la App
El cliente debe:
1. Abrir la app PSS Mobile
2. Iniciar sesión
3. Su token se registra automáticamente en MongoDB

### 4. Enviar Notificación desde la Web
1. Abre `panel.html` en tu navegador
2. Verás la lista de usuarios conectados
3. Selecciona un usuario
4. Escribe el título y mensaje
5. Haz clic en "Enviar Notificación"
6. ¡El cliente recibe la notificación en su app!

## 📱 Archivos Importantes

- **panel.html** - Panel web completo con lista de usuarios
- **web-sender.html** - Formulario simple para enviar notificaciones
- **server.js** - Servidor que maneja todo

## 🔌 API para tu Página Web

### Obtener usuarios registrados
```javascript
fetch('http://localhost:3001/api/notifications/users')
  .then(r => r.json())
  .then(users => console.log(users));
```

### Enviar notificación
```javascript
fetch('http://localhost:3001/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '123',
    title: 'Nuevo Ticket',
    body: 'Ticket #456 asignado',
    data: { ticketId: 456, type: 'new_ticket' }
  })
});
```

### Enviar a múltiples usuarios
```javascript
fetch('http://localhost:3001/api/notifications/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['123', '456', '789'],
    title: 'Mantenimiento Programado',
    body: 'El sistema estará en mantenimiento mañana'
  })
});
```

## 🔧 Integración con tu Web Actual

Si ya tienes una página web, solo necesitas hacer fetch al API:

```javascript
// Ejemplo: Enviar notificación cuando asignas un ticket
async function asignarTicket(ticketId, tecnicoId) {
  // Tu lógica actual...
  
  // Enviar notificación
  await fetch('http://localhost:3001/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: tecnicoId,
      title: 'Nuevo Ticket Asignado',
      body: `Ticket #${ticketId} requiere tu atención`,
      data: { ticketId, type: 'new_ticket' }
    })
  });
}
```

## 🌐 Para Producción

1. Despliega el servidor en tu hosting
2. Actualiza la URL en tu página web:
```javascript
const API_URL = 'https://tu-servidor.com/api';
```

3. En la app, actualiza `constants/api.ts`:
```typescript
export const PATH_NOTIFICATION_SERVICE = "https://tu-servidor.com/api";
```

## ✅ Verificar que Funciona

1. Cliente inicia sesión en la app
2. Ejecuta en terminal:
```bash
cd notification-service
node get-users.js
```
Deberías ver el usuario listado.

3. Abre `panel.html` y envía una notificación
4. El cliente la recibe en su app

## 💡 Tips

- Los usuarios deben iniciar sesión al menos una vez para registrar su token
- Puedes ver todos los tokens en MongoDB Atlas
- El panel web se actualiza en tiempo real
- Las notificaciones funcionan incluso con la app cerrada

## 🐛 Solución de Problemas

**"No hay usuarios registrados"**
→ Los clientes deben iniciar sesión en la app primero

**"Error al cargar usuarios"**
→ Verifica que el servidor esté corriendo en puerto 3001

**"Token no encontrado"**
→ El usuario debe iniciar sesión nuevamente en la app

## 📞 Comandos Útiles

```bash
# Ver usuarios registrados
node get-users.js

# Ver tokens completos
npm run list-tokens

# Enviar notificación de prueba
node test-send.js <userId>
```
