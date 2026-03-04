// Ejemplos de Integración - Notificaciones con Linterna
// Para usar en tu backend principal (pss.alphasys.com.bo/bck)

const NOTIFICATION_SERVICE_URL = 'http://localhost:3001/api';

// ============================================
// EJEMPLO 1: Notificación Normal
// ============================================
async function enviarNotificacionNormal(tecnicoId, ticketId) {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: tecnicoId,
        title: 'Nuevo Ticket Asignado',
        body: `Ticket #${ticketId} requiere tu atención`,
        data: {
          type: 'new_ticket',
          ticketId: ticketId,
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await response.json();
    console.log('✅ Notificación enviada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    throw error;
  }
}

// ============================================
// EJEMPLO 2: Notificación Urgente con Linterna
// ============================================
async function enviarNotificacionUrgente(tecnicoId, ticketId, mensaje) {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: tecnicoId,
        title: '🚨 ALERTA URGENTE',
        body: mensaje || `Ticket crítico #${ticketId} - Atención inmediata requerida`,
        data: {
          type: 'urgent',
          alarm: true,  // ⚡ Activa sonido continuo + vibración + linterna
          ticketId: ticketId,
          priority: 'high',
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await response.json();
    console.log('🚨 Notificación urgente enviada:', result);
    return result;
  } catch (error) {
    console.error('❌ Error enviando notificación urgente:', error);
    throw error;
  }
}

// ============================================
// EJEMPLO 3: Notificación Masiva Urgente
// ============================================
async function enviarNotificacionMasivaUrgente(tecnicoIds, mensaje) {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: tecnicoIds,
        title: '🚨 ALERTA GENERAL',
        body: mensaje,
        data: {
          type: 'urgent',
          alarm: true,
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await response.json();
    console.log(`🚨 Notificación masiva enviada a ${tecnicoIds.length} técnicos`);
    return result;
  } catch (error) {
    console.error('❌ Error enviando notificación masiva:', error);
    throw error;
  }
}

// ============================================
// EJEMPLO 4: Integración con Express.js
// ============================================
const express = require('express');
const app = express();

// Endpoint: Crear ticket urgente
app.post('/api/tickets/urgent', async (req, res) => {
  try {
    const { tecnicoId, titulo, descripcion, prioridad } = req.body;

    // 1. Crear el ticket en tu base de datos
    const ticket = await crearTicketEnBD({
      tecnicoId,
      titulo,
      descripcion,
      prioridad: 'URGENTE'
    });

    // 2. Enviar notificación urgente con linterna
    if (prioridad === 'URGENTE') {
      await enviarNotificacionUrgente(
        tecnicoId,
        ticket.id,
        `${titulo} - Requiere atención inmediata`
      );
    } else {
      await enviarNotificacionNormal(tecnicoId, ticket.id);
    }

    res.json({
      success: true,
      ticket,
      notificationSent: true
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Cambio de estado a crítico
app.put('/api/tickets/:id/critical', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // 1. Actualizar ticket
    const ticket = await actualizarTicketEnBD(ticketId, {
      estado: 'CRITICO',
      prioridad: 'URGENTE'
    });

    // 2. Notificar al técnico asignado con alarma
    await enviarNotificacionUrgente(
      ticket.tecnicoId,
      ticketId,
      `Ticket #${ticketId} ahora es CRÍTICO - Atención inmediata`
    );

    res.json({
      success: true,
      ticket,
      notificationSent: true
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EJEMPLO 5: Integración con PHP
// ============================================
/*
<?php
// enviar-notificacion-urgente.php

function enviarNotificacionUrgente($tecnicoId, $ticketId, $mensaje) {
    $url = 'http://localhost:3001/api/notifications/send';
    
    $data = [
        'userId' => $tecnicoId,
        'title' => '🚨 ALERTA URGENTE',
        'body' => $mensaje,
        'data' => [
            'type' => 'urgent',
            'alarm' => true,
            'ticketId' => $ticketId,
            'timestamp' => date('c')
        ]
    ];
    
    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return json_decode($result, true);
}

// Uso
$resultado = enviarNotificacionUrgente(
    '123',
    '456',
    'Ticket crítico #456 - Atención inmediata'
);

if ($resultado['success']) {
    echo "✅ Notificación urgente enviada\n";
} else {
    echo "❌ Error: " . $resultado['error'] . "\n";
}
?>
*/

// ============================================
// EJEMPLO 6: Integración con Python
// ============================================
/*
# enviar_notificacion_urgente.py
import requests
from datetime import datetime

def enviar_notificacion_urgente(tecnico_id, ticket_id, mensaje):
    url = 'http://localhost:3001/api/notifications/send'
    
    data = {
        'userId': tecnico_id,
        'title': '🚨 ALERTA URGENTE',
        'body': mensaje,
        'data': {
            'type': 'urgent',
            'alarm': True,  # Activa sonido + vibración + linterna
            'ticketId': ticket_id,
            'timestamp': datetime.now().isoformat()
        }
    }
    
    response = requests.post(url, json=data)
    return response.json()

# Uso
resultado = enviar_notificacion_urgente(
    '123',
    '456',
    'Ticket crítico #456 - Atención inmediata'
)

if resultado.get('success'):
    print('✅ Notificación urgente enviada')
else:
    print(f"❌ Error: {resultado.get('error')}")
*/

// ============================================
// EJEMPLO 7: Webhook para Sistema Externo
// ============================================
app.post('/webhook/ticket-created', async (req, res) => {
  try {
    const { ticket, tecnico } = req.body;
    
    // Determinar si es urgente basado en prioridad o SLA
    const esUrgente = ticket.prioridad === 'ALTA' || ticket.sla < 2; // SLA < 2 horas
    
    if (esUrgente) {
      // Enviar con alarma y linterna
      await enviarNotificacionUrgente(
        tecnico.id,
        ticket.id,
        `Ticket urgente #${ticket.id}: ${ticket.titulo}`
      );
    } else {
      // Enviar notificación normal
      await enviarNotificacionNormal(tecnico.id, ticket.id);
    }
    
    res.json({ success: true, urgent: esUrgente });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EJEMPLO 8: Notificación con Timeout
// ============================================
async function enviarNotificacionConTimeout(tecnicoId, ticketId, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: tecnicoId,
        title: '🚨 ALERTA URGENTE',
        body: `Ticket #${ticketId} requiere atención`,
        data: { type: 'urgent', alarm: true, ticketId }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Timeout enviando notificación');
    }
    throw error;
  }
}

// ============================================
// EJEMPLO 9: Retry Logic
// ============================================
async function enviarNotificacionConReintentos(tecnicoId, ticketId, maxReintentos = 3) {
  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      console.log(`Intento ${intento} de ${maxReintentos}...`);
      
      const resultado = await enviarNotificacionUrgente(tecnicoId, ticketId);
      
      console.log('✅ Notificación enviada exitosamente');
      return resultado;
    } catch (error) {
      console.error(`❌ Intento ${intento} falló:`, error.message);
      
      if (intento === maxReintentos) {
        throw new Error(`No se pudo enviar notificación después de ${maxReintentos} intentos`);
      }
      
      // Esperar antes de reintentar (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * intento));
    }
  }
}

// ============================================
// EJEMPLO 10: Logging y Monitoreo
// ============================================
async function enviarNotificacionConLog(tecnicoId, ticketId, esUrgente = false) {
  const inicio = Date.now();
  
  try {
    console.log(`📤 Enviando notificación ${esUrgente ? 'URGENTE' : 'normal'} a técnico ${tecnicoId}`);
    
    const resultado = esUrgente
      ? await enviarNotificacionUrgente(tecnicoId, ticketId)
      : await enviarNotificacionNormal(tecnicoId, ticketId);
    
    const duracion = Date.now() - inicio;
    
    console.log(`✅ Notificación enviada en ${duracion}ms`);
    
    // Guardar en log o base de datos
    await guardarLogNotificacion({
      tecnicoId,
      ticketId,
      tipo: esUrgente ? 'urgente' : 'normal',
      duracion,
      exito: true,
      timestamp: new Date()
    });
    
    return resultado;
  } catch (error) {
    const duracion = Date.now() - inicio;
    
    console.error(`❌ Error enviando notificación después de ${duracion}ms:`, error);
    
    // Guardar error en log
    await guardarLogNotificacion({
      tecnicoId,
      ticketId,
      tipo: esUrgente ? 'urgente' : 'normal',
      duracion,
      exito: false,
      error: error.message,
      timestamp: new Date()
    });
    
    throw error;
  }
}

// ============================================
// Funciones auxiliares (implementar según tu BD)
// ============================================
async function crearTicketEnBD(datos) {
  // Implementar según tu base de datos
  return { id: '123', ...datos };
}

async function actualizarTicketEnBD(id, datos) {
  // Implementar según tu base de datos
  return { id, ...datos };
}

async function guardarLogNotificacion(log) {
  // Implementar según tu sistema de logs
  console.log('📝 Log guardado:', log);
}

// ============================================
// Exportar funciones
// ============================================
module.exports = {
  enviarNotificacionNormal,
  enviarNotificacionUrgente,
  enviarNotificacionMasivaUrgente,
  enviarNotificacionConTimeout,
  enviarNotificacionConReintentos,
  enviarNotificacionConLog
};
