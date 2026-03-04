const fetch = require('node-fetch');

async function sendUrgentToAll() {
  try {
    console.log('\n🔍 Obteniendo usuarios...');
    const usersResponse = await fetch('http://localhost:3001/api/notifications/users');
    
    if (!usersResponse.ok) {
      throw new Error('Error al obtener usuarios');
    }
    
    const users = await usersResponse.json();

    if (!Array.isArray(users) || users.length === 0) {
      console.log('❌ No hay usuarios registrados\n');
      return;
    }

    console.log(`✅ ${users.length} usuario(s) encontrado(s)\n`);

    const userIds = users.map(u => u.userId);

    console.log('🚨 Enviando notificación URGENTE a todos...\n');
    
    const response = await fetch('http://localhost:3001/api/notifications/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds,
        title: '🚨 ALERTA URGENTE',
        body: 'Prueba de notificación masiva con sonido, vibración y linterna',
        data: { 
          type: 'urgent',
          alarm: true,  // ⚡ Activa sonido + vibración + linterna
          timestamp: new Date().toISOString()
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Notificaciones urgentes enviadas exitosamente');
      console.log(`📊 Total: ${result.sent}\n`);
      console.log('📋 Usuarios notificados:');
      users.forEach(u => console.log(`   ✓ ${u.email}`));
      console.log('\n💡 Efectos en todos los dispositivos:');
      console.log('   🔊 Sonido continuo en loop');
      console.log('   📳 Vibración cada 500ms');
      console.log('   🔦 Linterna parpadeando cada 500ms\n');
    } else {
      console.log('❌ Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   cd notification-service && npm start\n');
  }
}

sendUrgentToAll();
