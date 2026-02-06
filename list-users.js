const fetch = require('node-fetch');

console.log('\n📋 Obteniendo usuarios registrados...\n');

fetch('http://localhost:3001/api/notifications/users')
  .then(response => response.json())
  .then(users => {
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      console.log('💡 Los usuarios deben iniciar sesión en la app primero\n');
      return;
    }

    console.log('👥 Usuarios Registrados:\n');
    console.log('ID\t\tEmail\t\t\t\tDispositivo');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      const device = `${user.deviceInfo?.platform || 'N/A'} - ${user.deviceInfo?.model || 'N/A'}`;
      console.log(`${user.userId}\t\t${user.email}\t\t${device}`);
    });
    
    console.log(`\n✅ Total: ${users.length} usuario(s)\n`);
    console.log('💡 Para enviar notificación usa:');
    console.log(`   node send-notification.js ${users[0].userId}\n`);
  })
  .catch(error => {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd notification-service && npm start\n');
  });
