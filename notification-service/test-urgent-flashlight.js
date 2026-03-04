const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function enviarNotificacionUrgente() {
  try {
    console.log('🔍 Obteniendo usuarios registrados...');
    
    const usersResponse = await fetch(`${API_URL}/notifications/users`);
    const users = await usersResponse.json();
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      console.log('💡 Primero inicia sesión en la app móvil');
      return;
    }
    
    console.log(`✅ Encontrados ${users.length} usuario(s):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.userId})`);
    });
    
    // Usar el primer usuario
    const targetUser = users[0];
    console.log(`\n📱 Enviando notificación urgente a: ${targetUser.email}`);
    
    const notification = {
      userId: targetUser.userId,
      title: '🚨 ALERTA URGENTE',
      body: 'Prueba de notificación con sonido, vibración y linterna',
      data: {
        type: 'urgent',
        alarm: true,
        ticketId: '999',
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    
    console.log('✅ Notificación enviada exitosamente!');
    console.log('\n📋 Detalles:');
    console.log('   - Sonido: Loop continuo');
    console.log('   - Vibración: Cada 500ms');
    console.log('   - Linterna: Parpadeando cada 500ms');
    console.log('\n💡 Para detener:');
    console.log('   - Toca la notificación');
    console.log('   - Presiona el botón de silenciar en la app');
    console.log('   - Se detendrá automáticamente en 60 segundos');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. El servidor de notificaciones esté corriendo (npm start)');
    console.log('   2. La app móvil esté instalada y con sesión iniciada');
  }
}

// Ejecutar
enviarNotificacionUrgente();
