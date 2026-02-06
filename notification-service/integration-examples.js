// Ejemplo de cómo integrar notificaciones con el sistema de tickets existente

const fetch = require('node-fetch');

const NOTIFICATION_SERVICE = 'http://localhost:3001/api';

// Función auxiliar para enviar notificaciones
async function sendNotification(userId, title, body, data) {
  try {
    await fetch(`${NOTIFICATION_SERVICE}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, data }),
    });
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}

// ============================================
// EJEMPLOS DE USO EN TU BACKEND PRINCIPAL
// ============================================

// 1. Cuando se crea un nuevo ticket
async function onTicketCreated(ticket) {
  await sendNotification(
    ticket.tecnicoAsignadoId,
    '🎫 Nuevo Ticket Asignado',
    `Ticket #${ticket.id} - ${ticket.titulo}`,
    {
      type: 'new_ticket',
      ticketId: ticket.id,
      priority: ticket.prioridad,
      screen: 'TicketDetails',
    }
  );
}

// 2. Cuando cambia el estado de un ticket
async function onTicketStatusChanged(ticket, oldStatus, newStatus) {
  await sendNotification(
    ticket.solicitanteId,
    '📊 Estado de Ticket Actualizado',
    `Ticket #${ticket.id}: ${oldStatus} → ${newStatus}`,
    {
      type: 'status_change',
      ticketId: ticket.id,
      oldStatus,
      newStatus,
      screen: 'TicketDetails',
    }
  );
}

// 3. Cuando se agrega un comentario
async function onCommentAdded(ticket, comment, authorName) {
  await sendNotification(
    ticket.tecnicoAsignadoId,
    '💬 Nuevo Comentario',
    `${authorName}: ${comment.substring(0, 50)}...`,
    {
      type: 'new_comment',
      ticketId: ticket.id,
      screen: 'TicketDetails',
    }
  );
}

// 4. Recordatorio de ticket pendiente
async function sendTicketReminder(tecnicoId, ticketsCount) {
  await sendNotification(
    tecnicoId,
    '⏰ Recordatorio',
    `Tienes ${ticketsCount} ticket(s) pendiente(s)`,
    {
      type: 'reminder',
      screen: 'Tickets',
    }
  );
}

// 5. Notificación masiva a un equipo
async function notifyTeam(userIds, title, body) {
  try {
    await fetch(`${NOTIFICATION_SERVICE}/notifications/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, title, body, data: { type: 'team' } }),
    });
  } catch (error) {
    console.error('Error enviando notificación masiva:', error);
  }
}

// ============================================
// INTEGRACIÓN CON EXPRESS ROUTES
// ============================================

// Ejemplo en tu backend principal (Express)
/*
const express = require('express');
const router = express.Router();

// Crear ticket
router.post('/tickets', async (req, res) => {
  try {
    const ticket = await createTicket(req.body);
    
    // Enviar notificación al técnico asignado
    await sendNotification(
      ticket.tecnicoAsignadoId,
      '🎫 Nuevo Ticket Asignado',
      `Ticket #${ticket.id} - ${ticket.titulo}`,
      { type: 'new_ticket', ticketId: ticket.id }
    );
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de ticket
router.patch('/tickets/:id/status', async (req, res) => {
  try {
    const ticket = await updateTicketStatus(req.params.id, req.body.status);
    
    // Notificar al solicitante
    await sendNotification(
      ticket.solicitanteId,
      '📊 Estado Actualizado',
      `Ticket #${ticket.id}: ${req.body.status}`,
      { type: 'status_change', ticketId: ticket.id }
    );
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
*/

// ============================================
// MANEJO DE NAVEGACIÓN EN LA APP
// ============================================

/*
En tu app React Native, maneja la navegación cuando se toca una notificación:

// En NotificationContext.tsx o App.tsx
responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  // Navegar según el tipo de notificación
  if (data.screen === 'TicketDetails' && data.ticketId) {
    navigation.navigate('TicketDetails', { ticketId: data.ticketId });
  } else if (data.screen === 'Tickets') {
    navigation.navigate('Tickets');
  }
});
*/

module.exports = {
  sendNotification,
  notifyTeam,
  onTicketCreated,
  onTicketStatusChanged,
  onCommentAdded,
  sendTicketReminder,
};
