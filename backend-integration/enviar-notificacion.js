/**
 * Función para enviar notificaciones push desde Node.js
 * 
 * Instalación:
 * npm install node-fetch
 */

const fetch = require('node-fetch');

/**
 * Envía una notificación push a un usuario
 * 
 * @param {string} expoPushToken - Token de Expo del usuario
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo del mensaje
 * @param {object} data - Datos adicionales (ticketId, type, etc)
 * @param {string} channelId - Canal de notificación ('default', 'urgent-notifications', 'critical-alarm')
 * @returns {Promise<object>} Respuesta de Expo
 */
async function enviarNotificacion(expoPushToken, title, body, data = {}, channelId = 'default') {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: channelId,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'ok') {
      console.log('✅ Notificación enviada exitosamente');
      return { success: true, data: result.data };
    } else {
      console.error('❌ Error enviando notificación:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía notificaciones a múltiples usuarios
 * 
 * @param {Array<string>} tokens - Array de tokens de Expo
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo del mensaje
 * @param {object} data - Datos adicionales
 * @param {string} channelId - Canal de notificación
 * @returns {Promise<object>} Resultado del envío
 */
async function enviarNotificacionMasiva(tokens, title, body, data = {}, channelId = 'default') {
  try {
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
      channelId: channelId,
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log(`✅ Notificaciones enviadas a ${tokens.length} usuarios`);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funciones
module.exports = {
  enviarNotificacion,
  enviarNotificacionMasiva,
};

// Ejemplo de uso
if (require.main === module) {
  const token = 'ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]';
  
  enviarNotificacion(
    token,
    'Nuevo Ticket Asignado',
    'Ticket #456 requiere tu atención',
    { ticketId: 456, type: 'new_ticket' },
    'urgent-notifications'
  );
}
