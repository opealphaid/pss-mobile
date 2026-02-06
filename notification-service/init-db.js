require('dotenv').config();
const { MongoClient } = require('mongodb');

async function initDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('\n🔄 Conectando a MongoDB...\n');
    await client.connect();
    
    const db = client.db('Clients');
    console.log('✅ Conectado a la base de datos: Clients');
    
    // Crear colecciones si no existen
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\n📊 Colecciones existentes:', collectionNames.length > 0 ? collectionNames.join(', ') : 'Ninguna');
    
    // Crear índices para optimizar búsquedas
    if (!collectionNames.includes('pushTokens')) {
      await db.createCollection('pushTokens');
      console.log('✅ Colección "pushTokens" creada');
    }
    
    if (!collectionNames.includes('notifications')) {
      await db.createCollection('notifications');
      console.log('✅ Colección "notifications" creada');
    }
    
    // Crear índices
    await db.collection('pushTokens').createIndex({ userId: 1 }, { unique: true });
    await db.collection('pushTokens').createIndex({ email: 1 });
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ sentAt: -1 });
    
    console.log('✅ Índices creados');
    
    // Verificar datos
    const tokenCount = await db.collection('pushTokens').countDocuments();
    const notificationCount = await db.collection('notifications').countDocuments();
    
    console.log('\n📈 Estadísticas:');
    console.log(`   - Tokens registrados: ${tokenCount}`);
    console.log(`   - Notificaciones enviadas: ${notificationCount}`);
    
    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Iniciar el servidor: npm start');
    console.log('   2. Hacer login en la app para registrar tokens');
    console.log('   3. Enviar notificaciones: node test-send.js <userId>\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

initDatabase();
