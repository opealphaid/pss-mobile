const fetch = require('node-fetch');

// Token que obtuviste de los logs
const EXPO_PUSH_TOKEN = process.argv[2] || 'ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]';

const message = {
  to: EXPO_PUSH_TOKEN,
  sound: 'default',
  title: 'ALERTA URGENTE',
  body: 'Esta es una notificación de alta prioridad',
  data: { 
    ticketId: 123,
    type: 'urgent',
    timestamp: new Date().toISOString(),
    flashlight: true,
    alarm: true,
    image: 'https://i.imgur.com/placeholder.png' // URL de tu logo
  },
  priority: 'high',
  channelId: 'critical-alarm',
  categoryId: 'alarm'
};

console.log('\n📤 Enviando notificación...');
console.log('Token:', EXPO_PUSH_TOKEN);
console.log('');

fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
})
  .then(response => response.json())
  .then(data => {
    console.log('✅ Notificación enviada:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
