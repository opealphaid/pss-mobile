const fetch = require('node-fetch');

const userId = process.argv[2];

if (!userId) {
  console.log('❌ Debes proporcionar un userId');
  console.log('Uso: node send-notification.js <userId>');
  console.log('Ejemplo: node send-notification.js 123');
  process.exit(1);
}

const notification = {
  userId,
  title: '🎉 Notificación de Prueba PSS',
  body: 'Esta es una notificación de prueba desde el servidor',
  data: {
    type: 'test',
    ticketId: 456,
    timestamp: new Date().toISOString()
  }
};

console.log(`\n📤 Enviando notificación a usuario ${userId}...\n`);

fetch('http://localhost:3001/api/notifications/send', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(notification),
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Notificación enviada exitosamente');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd notification-service && npm start');
  });
