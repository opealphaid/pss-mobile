const fetch = require('node-fetch');

const title = process.argv[2];
const body = process.argv[3];

if (!title || !body) {
  console.log('❌ Debes proporcionar título y mensaje');
  console.log('Uso: node send-to-all.js "<título>" "<mensaje>"');
  console.log('Ejemplo: node send-to-all.js "Mantenimiento" "El sistema estará en mantenimiento mañana"');
  process.exit(1);
}

async function sendToAll() {
  try {
    // Obtener todos los usuarios
    console.log('\n📋 Obteniendo usuarios...');
    const usersResponse = await fetch('http://localhost:3001/api/notifications/users');
    
    if (!usersResponse.ok) {
      throw new Error('Error al obtener usuarios');
    }
    
    const users = await usersResponse.json();

    if (!Array.isArray(users) || users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      console.log('💡 Los usuarios deben iniciar sesión en la app primero\n');
      return;
    }

    console.log(`✅ ${users.length} usuario(s) encontrado(s)\n`);

    const userIds = users.map(u => u.userId);

    // Enviar notificación masiva
    console.log('📤 Enviando notificaciones...\n');
    
    const response = await fetch('http://localhost:3001/api/notifications/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds,
        title,
        body,
        data: { type: 'broadcast', timestamp: new Date().toISOString() }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Notificaciones enviadas exitosamente');
      console.log(`📊 Total enviadas: ${result.sent}`);
      console.log('\n👥 Usuarios notificados:');
      users.forEach(u => {
        console.log(`   - ${u.email} (ID: ${u.userId})`);
      });
      console.log('');
    } else {
      console.log('❌ Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd notification-service && npm start\n');
  }
}

sendToAll();
