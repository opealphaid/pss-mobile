require('dotenv').config();
const { MongoClient } = require('mongodb');

async function getUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('Clients');
    
    const tokens = await db.collection('pushTokens').find({}).toArray();
    
    console.log('\n📋 Usuarios Registrados:\n');
    console.log('ID\t\tEmail\t\t\t\tDispositivo');
    console.log('─'.repeat(80));
    
    tokens.forEach(token => {
      const device = `${token.deviceInfo?.platform || 'N/A'} - ${token.deviceInfo?.model || 'N/A'}`;
      console.log(`${token.userId}\t\t${token.email}\t\t${device}`);
    });
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

getUsers();
