const fetch = require('node-fetch');

const title = process.argv[2];
const body = process.argv[3];

if (!title || !body) {
  console.log('❌ Debes proporcionar título y mensaje');
  console.log('Uso: npm run notify-all "<título>" "<mensaje>"');
  console.log('Ejemplo: npm run notify-all "Mantenimiento" "Sistema en mantenimiento mañana"');
  process.exit(1);
}

async function sendToAll() {
  try {
    console.log('\n📋 Obteniendo usuarios...');
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

    console.log('📤 Enviando notificaciones...\n');
    
    const response = await fetch('http://localhost:3001/api/notifications/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds,
        title,
        body,
        data: { type: 'broadcast' }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Notificaciones enviadas exitosamente');
      console.log(`📊 Total: ${result.sent}\n`);
      users.forEach(u => console.log(`   ✓ ${u.email}`));
      console.log('');
    } else {
      console.log('❌ Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendToAll();
