# 🔔 Tipos de Notificaciones

## 📋 Tipos Disponibles

### 1. Normal (default)
Notificación estándar para información general.

```json
{
  "to": "ExponentPushToken[...]",
  "title": "Información",
  "body": "Mensaje informativo",
  "data": {
    "type": "normal"
  },
  "channelId": "default"
}
```

**Comportamiento:**
- Sonido estándar
- Vibración suave
- No despierta al usuario si está dormido

---

### 2. Nuevo Ticket (new_ticket)
Cuando se asigna un nuevo ticket al técnico.

```json
{
  "to": "ExponentPushToken[...]",
  "title": "Nuevo Ticket Asignado",
  "body": "Ticket #456 - Problema con servidor",
  "data": {
    "ticketId": 456,
    "type": "new_ticket",
    "priority": "high"
  },
  "channelId": "urgent-notifications"
}
```

**Comportamiento:**
- Sonido de notificación
- Vibración media
- Navega a lista de tickets al tocar

---

### 3. Cambio de Estado (status_change)
Cuando cambia el estado de un ticket.

```json
{
  "to": "ExponentPushToken[...]",
  "title": "Estado Actualizado",
  "body": "Ticket #456: En Progreso → Resuelto",
  "data": {
    "ticketId": 456,
    "type": "status_change",
    "oldStatus": "En Progreso",
    "newStatus": "Resuelto"
  },
  "channelId": "default"
}
```

---

### 4. Nuevo Comentario (new_comment)
Cuando alguien comenta en un ticket.

```json
{
  "to": "ExponentPushToken[...]",
  "title": "Nuevo Comentario",
  "body": "Juan Pérez: He revisado el problema...",
  "data": {
    "ticketId": 456,
    "type": "new_comment",
    "commentId": 789
  },
  "channelId": "default"
}
```

---

### 5. Recordatorio (reminder)
Recordatorios automáticos.

```json
{
  "to": "ExponentPushToken[...]",
  "title": "Recordatorio",
  "body": "Tienes 3 tickets pendientes",
  "data": {
    "type": "reminder",
    "count": 3
  },
  "channelId": "default"
}
```

---

### 6. URGENTE (urgent) ⚠️
**Alerta crítica que despierta al usuario**

```json
{
  "to": "ExponentPushToken[...]",
  "title": "ALERTA URGENTE",
  "body": "Servidor principal caído - Requiere atención inmediata",
  "data": {
    "ticketId": 456,
    "type": "urgent",
    "alarm": true,
    "flashlight": true
  },
  "priority": "high",
  "channelId": "critical-alarm"
}
```

**Comportamiento:**
- ✅ Alarma continua (no se detiene)
- ✅ Vibración intensa continua
- ✅ Linterna parpadeante
- ✅ Suena incluso en modo silencio
- ✅ Bypass modo No Molestar
- ✅ Despierta al usuario
- ✅ Solo se detiene al tocar la notificación

**Cuándo usar:**
- Servidores caídos
- Problemas críticos de producción
- Emergencias que requieren atención inmediata
- Situaciones que no pueden esperar

---

## 🎯 Canales de Notificación

### default
Notificaciones normales y de baja prioridad.

### urgent-notifications
Notificaciones importantes que requieren atención pronto.

### critical-alarm
**Solo para emergencias críticas**. Usa alarma de sistema que suena incluso en silencio.

---

## 📊 Campos Disponibles

### Campos Principales

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `to` | string | ✅ | Token de Expo del usuario |
| `title` | string | ✅ | Título de la notificación |
| `body` | string | ✅ | Cuerpo del mensaje |
| `data` | object | ❌ | Datos adicionales |
| `priority` | string | ❌ | 'default', 'normal', 'high' |
| `channelId` | string | ❌ | Canal de Android |
| `sound` | string | ❌ | 'default' o null |

### Campos de Data

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | string | Tipo de notificación |
| `ticketId` | number | ID del ticket relacionado |
| `alarm` | boolean | Activar alarma continua |
| `flashlight` | boolean | Activar linterna |
| `priority` | string | Prioridad del ticket |

---

## 🚨 Mejores Prácticas

### ✅ Hacer

- Usar `critical-alarm` solo para emergencias reales
- Incluir `ticketId` en data para navegación
- Usar títulos claros y concisos
- Validar tokens antes de enviar
- Manejar errores de tokens inválidos

### ❌ No Hacer

- Abusar de notificaciones urgentes
- Enviar notificaciones sin contexto
- Usar emojis en títulos (usar iconos en la app)
- Enviar notificaciones duplicadas
- Ignorar errores de envío

---

## 📝 Ejemplo Completo

```javascript
// Función helper para determinar el tipo de notificación
function enviarNotificacionTicket(ticket, usuario) {
  let channelId = 'default';
  let data = {
    ticketId: ticket.id,
    type: 'new_ticket'
  };
  
  // Determinar urgencia
  if (ticket.prioridad === 'CRITICA') {
    channelId = 'critical-alarm';
    data.alarm = true;
    data.flashlight = true;
    data.type = 'urgent';
  } else if (ticket.prioridad === 'ALTA') {
    channelId = 'urgent-notifications';
  }
  
  return enviarNotificacion(
    usuario.expo_push_token,
    ticket.prioridad === 'CRITICA' ? 'ALERTA CRÍTICA' : 'Nuevo Ticket',
    `Ticket #${ticket.id} - ${ticket.titulo}`,
    data,
    channelId
  );
}
```
