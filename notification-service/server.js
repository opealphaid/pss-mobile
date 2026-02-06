require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(cors());
app.use(express.json());

let db;
const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Conectar a MongoDB
async function connectDB() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    db = client.db('Clients');
    console.log('✅ Conectado a MongoDB - Base de datos: Clients');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('\n💡 Soluciones posibles:');
    console.log('   1. Verifica tu conexión a internet');
    console.log('   2. Verifica las credenciales en .env');
    console.log('   3. Verifica que tu IP esté permitida en MongoDB Atlas');
    console.log('   4. Intenta: npm install mongodb@5.9.0\n');
    process.exit(1);
  }
}

// Registrar token de dispositivo
app.post('/api/notifications/register-token', async (req, res) => {
  try {
    const { userId, email, expoPushToken, deviceInfo } = req.body;

    if (!Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    await db.collection('pushTokens').updateOne(
      { userId },
      {
        $set: {
          userId,
          email,
          expoPushToken,
          deviceInfo,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Token registrado para usuario ${userId}`);
    res.json({ success: true, message: 'Token registrado' });
  } catch (error) {
    console.error('Error registrando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar notificación a un usuario
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    const tokenDoc = await db.collection('pushTokens').findOne({ userId });
    
    if (!tokenDoc) {
      return res.status(404).json({ error: 'Token no encontrado para el usuario' });
    }

    const messages = [{
      to: tokenDoc.expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Guardar notificación en historial
    await db.collection('notifications').insertOne({
      userId,
      title,
      body,
      data,
      sent: true,
      sentAt: new Date(),
      tickets,
    });

    console.log(`✅ Notificación enviada a usuario ${userId}`);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error enviando notificación:', error);
    res.status(500).json({ error: 'Error enviando notificación' });
  }
});

// Enviar notificación a múltiples usuarios
app.post('/api/notifications/send-bulk', async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;

    const tokens = await db.collection('pushTokens')
      .find({ userId: { $in: userIds } })
      .toArray();

    const messages = tokens.map(token => ({
      to: token.expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log(`✅ Notificaciones enviadas a ${userIds.length} usuarios`);
    res.json({ success: true, sent: tickets.length });
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    res.status(500).json({ error: 'Error enviando notificaciones' });
  }
});

// Obtener historial de notificaciones de un usuario
app.get('/api/notifications/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await db.collection('notifications')
      .find({ userId })
      .sort({ sentAt: -1 })
      .limit(50)
      .toArray();

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// Obtener todos los usuarios con tokens registrados
app.get('/api/notifications/users', async (req, res) => {
  try {
    const users = await db.collection('pushTokens')
      .find({}, { projection: { userId: 1, email: 1, deviceInfo: 1, updatedAt: 1 } })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de notificaciones corriendo en puerto ${PORT}`);
  });
});
