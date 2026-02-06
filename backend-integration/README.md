# 📱 Integración de Notificaciones Push - Backend

Esta carpeta contiene todo lo necesario para integrar notificaciones push desde tu backend.

## 📋 Contenido

- `README.md` - Esta guía
- `enviar-notificacion.js` - Función Node.js para enviar notificaciones
- `enviar-notificacion.php` - Función PHP para enviar notificaciones
- `enviar-notificacion.py` - Función Python para enviar notificaciones
- `ejemplos.md` - Ejemplos de uso en diferentes escenarios
- `tipos-notificaciones.md` - Tipos de notificaciones y sus configuraciones

## 🚀 Inicio Rápido

### 1. Obtener Token del Usuario

Cuando un usuario inicia sesión en la app móvil, se genera un token único. Este token debe guardarse en tu base de datos asociado al usuario.

**Ejemplo de token:**
```
ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]
```

### 2. Enviar Notificación

Usa el token del usuario para enviar notificaciones directamente a Expo Push Service.

**Endpoint:**
```
POST https://exp.host/--/api/v2/push/send
```

**Headers:**
```json
{
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "to": "ExponentPushToken[...]",
  "sound": "default",
  "title": "Nuevo Ticket Asignado",
  "body": "Ticket #456 requiere tu atención",
  "data": {
    "ticketId": 456,
    "type": "new_ticket"
  },
  "priority": "high",
  "channelId": "urgent-notifications"
}
```

## 📊 Estructura de Base de Datos

Agrega una columna a tu tabla de usuarios:

```sql
ALTER TABLE usuarios ADD COLUMN expo_push_token VARCHAR(255);
```

Cuando el usuario inicie sesión en la app, actualiza este campo:

```sql
UPDATE usuarios 
SET expo_push_token = 'ExponentPushToken[...]' 
WHERE id = 123;
```

## 🎯 Casos de Uso

### Nuevo Ticket Asignado

```javascript
await enviarNotificacion(
  userToken,
  'Nuevo Ticket Asignado',
  `Ticket #${ticketId} - ${titulo}`,
  { ticketId, type: 'new_ticket' }
);
```

### Cambio de Estado

```javascript
await enviarNotificacion(
  userToken,
  'Estado Actualizado',
  `Ticket #${ticketId}: ${nuevoEstado}`,
  { ticketId, type: 'status_change' }
);
```

### Alerta Urgente

```javascript
await enviarNotificacion(
  userToken,
  'ALERTA URGENTE',
  'Ticket crítico requiere atención inmediata',
  { ticketId, type: 'urgent', alarm: true },
  'critical-alarm'
);
```

## 🔔 Tipos de Notificaciones

### Normal
- Sonido estándar
- Vibración suave
- No despierta al usuario

```json
{
  "data": { "type": "normal" },
  "channelId": "default"
}
```

### Urgente
- Alarma continua
- Vibración intensa
- Linterna parpadeante
- Despierta al usuario

```json
{
  "data": { 
    "type": "urgent",
    "alarm": true
  },
  "channelId": "critical-alarm"
}
```

## 📝 Notas Importantes

1. **Guardar Tokens**: Actualiza el token cada vez que el usuario inicie sesión
2. **Validar Tokens**: Los tokens empiezan con `ExponentPushToken[`
3. **Manejo de Errores**: Verifica la respuesta de Expo para tokens inválidos
4. **Rate Limits**: Expo tiene límites de envío, agrupa notificaciones cuando sea posible

## 🔗 Enlaces Útiles

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)

## 💡 Ejemplo Completo

Ver `ejemplos.md` para implementaciones completas en diferentes lenguajes.
