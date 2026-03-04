const fetch = require('node-fetch');

const userId = process.argv[2];

if (!userId) {
  console.log('❌ Debes proporcionar un userId');
  console.log('Uso: node send-urgent-notification.js <userId>');
  console.log('Ejemplo: node send-urgent-notification.js 123');
  process.exit(1);
}

const notification = {
  userId,
  title: '🚨 ALERTA URGENTE',
  body: 'Prueba de notificación con sonido, vibración y linterna',
  data: {
    type: 'urgent',
    alarm: true,  // ⚡ Activa sonido continuo + vibración + linterna
    ticketId: 999,
    timestamp: new Date().toISOString()
  }
};

console.log(`\n🚨 Enviando notificación URGENTE a usuario ${userId}...\n`);

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
      console.log('✅ Notificación urgente enviada exitosamente');
      console.log('\n📋 Efectos en el dispositivo:');
      console.log('   🔊 Sonido continuo en loop');
      console.log('   📳 Vibración cada 500ms');
      console.log('   🔦 Linterna parpadeando cada 500ms');
      console.log('\n💡 Para detener:');
      console.log('   - Toca la notificación');
      console.log('   - Presiona el botón 🔇 en la app');
      console.log('   - Se detendrá automáticamente en 60 segundos');
    } else {
      console.log('❌ Error:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd notification-service && npm start');
  });
