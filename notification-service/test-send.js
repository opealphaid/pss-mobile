const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

// Función para enviar notificación de prueba
async function sendTestNotification(userId) {
  try {
    const response = await fetch(`${BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: '🎉 Notificación de Prueba',
        body: 'Esta es una notificación de prueba desde el servidor',
        data: { 
          type: 'test',
          timestamp: new Date().toISOString(),
          ticketId: 123
        },
      }),
    });

    const result = await response.json();
    console.log('✅ Notificación enviada:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Obtener userId desde argumentos de línea de comandos
const userId = process.argv[2];

if (!userId) {
  console.log('Uso: node test-send.js <userId>');
  console.log('Ejemplo: node test-send.js 123');
  process.exit(1);
}

sendTestNotification(userId);
