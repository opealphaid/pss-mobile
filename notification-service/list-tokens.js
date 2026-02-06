require('dotenv').config();
const { MongoClient } = require('mongodb');

async function listTokens() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('Clients');
    
    console.log('\n📱 Tokens Registrados:\n');
    
    const tokens = await db.collection('pushTokens').find({}).toArray();
    
    if (tokens.length === 0) {
      console.log('❌ No hay tokens registrados aún');
      console.log('💡 Inicia sesión en la app para registrar un token\n');
      return;
    }
    
    tokens.forEach((token, index) => {
      console.log(`${index + 1}. Usuario ID: ${token.userId}`);
      console.log(`   Email: ${token.email}`);
      console.log(`   Token: ${token.expoPushToken}`);
      console.log(`   Dispositivo: ${token.deviceInfo?.platform} - ${token.deviceInfo?.model}`);
      console.log(`   Actualizado: ${token.updatedAt}`);
      console.log('');
    });
    
    console.log(`Total: ${tokens.length} token(s) registrado(s)\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

listTokens();
