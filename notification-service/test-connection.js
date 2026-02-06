require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('\n🔄 Probando conexión a MongoDB...\n');
    
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const db = client.db('Clients');
    console.log('✅ Base de datos: Clients');
    
    const collections = await db.listCollections().toArray();
    console.log(`✅ Colecciones encontradas: ${collections.length}`);
    
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    const tokenCount = await db.collection('pushTokens').countDocuments();
    const notifCount = await db.collection('notifications').countDocuments();
    
    console.log('\n📊 Datos:');
    console.log(`   - Tokens: ${tokenCount}`);
    console.log(`   - Notificaciones: ${notifCount}`);
    
    console.log('\n✅ Todo funcionando correctamente\n');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.log('\n💡 Verifica:');
    console.log('   - Credenciales en .env');
    console.log('   - Conexión a internet');
    console.log('   - IP permitida en MongoDB Atlas\n');
  } finally {
    await client.close();
  }
}

testConnection();
