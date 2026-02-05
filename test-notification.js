const fetch = require('node-fetch');

const message = {
  to: 'ExponentPushToken[0ONOwfJ8pcmWQ1MiFFXk8_]',
  sound: 'default',
  title: 'Prueba PSS Mobile',
  body: 'Esta es una notificación de prueba con sonido y vibración',
  data: { ticketId: 123, test: true },
  priority: 'high',
};

fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
})
  .then(response => response.json())
  .then(data => console.log('Notificación enviada:', data))
  .catch(error => console.error('Error:', error));
