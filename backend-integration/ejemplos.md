# 📚 Ejemplos de Integración

## 🎯 Escenario 1: Nuevo Ticket Creado

### Node.js
```javascript
const { enviarNotificacion } = require('./enviar-notificacion');

// Cuando se crea un ticket
app.post('/api/tickets', async (req, res) => {
  const ticket = await crearTicket(req.body);
  
  // Obtener token del técnico asignado
  const tecnico = await db.usuarios.findOne({ id: ticket.tecnicoId });
  
  if (tecnico.expo_push_token) {
    await enviarNotificacion(
      tecnico.expo_push_token,
      'Nuevo Ticket Asignado',
      `Ticket #${ticket.id} - ${ticket.titulo}`,
      {
        ticketId: ticket.id,
        type: 'new_ticket',
        priority: ticket.prioridad
      },
      'urgent-notifications'
    );
  }
  
  res.json(ticket);
});
```

### PHP
```php
<?php
require_once 'enviar-notificacion.php';

// Cuando se crea un ticket
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ticket = crearTicket($_POST);
    
    // Obtener token del técnico
    $tecnico = $db->query("SELECT expo_push_token FROM usuarios WHERE id = ?", [$ticket['tecnicoId']])->fetch();
    
    if ($tecnico['expo_push_token']) {
        enviarNotificacion(
            $tecnico['expo_push_token'],
            'Nuevo Ticket Asignado',
            "Ticket #{$ticket['id']} - {$ticket['titulo']}",
            [
                'ticketId' => $ticket['id'],
                'type' => 'new_ticket',
                'priority' => $ticket['prioridad']
            ],
            'urgent-notifications'
        );
    }
    
    echo json_encode($ticket);
}
?>
```

### Python
```python
from enviar_notificacion import enviar_notificacion

# Cuando se crea un ticket
@app.route('/api/tickets', methods=['POST'])
def crear_ticket():
    ticket = crear_ticket_db(request.json)
    
    # Obtener token del técnico
    tecnico = db.usuarios.find_one({'id': ticket['tecnicoId']})
    
    if tecnico.get('expo_push_token'):
        enviar_notificacion(
            tecnico['expo_push_token'],
            'Nuevo Ticket Asignado',
            f"Ticket #{ticket['id']} - {ticket['titulo']}",
            {
                'ticketId': ticket['id'],
                'type': 'new_ticket',
                'priority': ticket['prioridad']
            },
            'urgent-notifications'
        )
    
    return jsonify(ticket)
```

## 🚨 Escenario 2: Alerta Crítica

### Node.js
```javascript
// Ticket crítico que requiere atención inmediata
await enviarNotificacion(
  tecnico.expo_push_token,
  'ALERTA CRÍTICA',
  `Ticket #${ticketId} - Servidor caído`,
  {
    ticketId: ticketId,
    type: 'urgent',
    alarm: true,
    flashlight: true
  },
  'critical-alarm'  // Canal de alarma crítica
);
```

## 📢 Escenario 3: Notificación Masiva

### Node.js
```javascript
const { enviarNotificacionMasiva } = require('./enviar-notificacion');

// Notificar a todo el equipo
const tecnicos = await db.usuarios.find({ rol: 'TECNICO' });
const tokens = tecnicos
  .map(t => t.expo_push_token)
  .filter(token => token); // Filtrar nulls

await enviarNotificacionMasiva(
  tokens,
  'Reunión de Equipo',
  'Reunión en 30 minutos en sala de conferencias',
  { type: 'meeting' },
  'default'
);
```

## 🔄 Escenario 4: Cambio de Estado

### Node.js
```javascript
// Cuando cambia el estado de un ticket
app.patch('/api/tickets/:id/estado', async (req, res) => {
  const ticket = await actualizarEstado(req.params.id, req.body.estado);
  
  // Notificar al solicitante
  const solicitante = await db.usuarios.findOne({ id: ticket.solicitanteId });
  
  if (solicitante.expo_push_token) {
    await enviarNotificacion(
      solicitante.expo_push_token,
      'Estado Actualizado',
      `Ticket #${ticket.id}: ${req.body.estado}`,
      {
        ticketId: ticket.id,
        type: 'status_change',
        oldStatus: ticket.estadoAnterior,
        newStatus: req.body.estado
      }
    );
  }
  
  res.json(ticket);
});
```

## 💬 Escenario 5: Nuevo Comentario

### Node.js
```javascript
// Cuando se agrega un comentario
app.post('/api/tickets/:id/comentarios', async (req, res) => {
  const comentario = await agregarComentario(req.params.id, req.body);
  const ticket = await db.tickets.findOne({ id: req.params.id });
  
  // Notificar al técnico asignado
  const tecnico = await db.usuarios.findOne({ id: ticket.tecnicoId });
  
  if (tecnico.expo_push_token) {
    await enviarNotificacion(
      tecnico.expo_push_token,
      'Nuevo Comentario',
      `${req.body.autor}: ${comentario.texto.substring(0, 50)}...`,
      {
        ticketId: ticket.id,
        type: 'new_comment',
        commentId: comentario.id
      }
    );
  }
  
  res.json(comentario);
});
```

## 🔔 Escenario 6: Recordatorio

### Node.js
```javascript
// Recordatorio diario de tickets pendientes
const cron = require('node-cron');

// Cada día a las 9 AM
cron.schedule('0 9 * * *', async () => {
  const tecnicos = await db.usuarios.find({ rol: 'TECNICO' });
  
  for (const tecnico of tecnicos) {
    const ticketsPendientes = await db.tickets.count({
      tecnicoId: tecnico.id,
      estado: 'PENDIENTE'
    });
    
    if (ticketsPendientes > 0 && tecnico.expo_push_token) {
      await enviarNotificacion(
        tecnico.expo_push_token,
        'Recordatorio',
        `Tienes ${ticketsPendientes} ticket(s) pendiente(s)`,
        {
          type: 'reminder',
          count: ticketsPendientes
        }
      );
    }
  }
});
```

## 📊 Escenario 7: Guardar Token al Login

### Node.js
```javascript
// Endpoint para actualizar token
app.post('/api/usuarios/update-token', async (req, res) => {
  const { userId, expoPushToken } = req.body;
  
  await db.usuarios.update(
    { id: userId },
    { expo_push_token: expoPushToken }
  );
  
  res.json({ success: true });
});
```

### SQL
```sql
-- Actualizar token del usuario
UPDATE usuarios 
SET expo_push_token = 'ExponentPushToken[...]',
    updated_at = NOW()
WHERE id = 123;
```

## ⚠️ Manejo de Errores

### Node.js
```javascript
const resultado = await enviarNotificacion(
  token,
  'Título',
  'Mensaje',
  { data: 'value' }
);

if (!resultado.success) {
  // Token inválido o expirado
  if (resultado.error?.details?.error === 'DeviceNotRegistered') {
    // Eliminar token de la base de datos
    await db.usuarios.update(
      { expo_push_token: token },
      { expo_push_token: null }
    );
  }
  
  console.error('Error:', resultado.error);
}
```
