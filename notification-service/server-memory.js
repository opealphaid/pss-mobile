require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(cors());
app.use(express.json());

// Almacenamiento temporal en memoria (mientras no funcione MongoDB)
const tokensStore = new Map();
const notificationsStore = [];

console.log('⚠️  Usando almacenamiento en memoria (temporal)');
console.log('💡 Para usar MongoDB, instala Node.js v20 LTS');

// Registrar token de dispositivo
app.post('/api/notifications/register-token', async (req, res) => {
  try {
    const { userId, email, expoPushToken, deviceInfo } = req.body;

    if (!Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    tokensStore.set(userId, {
      userId,
      email,
      expoPushToken,
      deviceInfo,
      updatedAt: new Date(),
    });

    console.log(`✅ Token registrado para usuario ${userId} (${email})`);
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

    const tokenDoc = tokensStore.get(userId);
    
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

    notificationsStore.push({
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

    const messages = [];
    userIds.forEach(userId => {
      const tokenDoc = tokensStore.get(userId);
      if (tokenDoc) {
        messages.push({
          to: tokenDoc.expoPushToken,
          sound: 'default',
          title,
          body,
          data: data || {},
          priority: 'high',
        });
      }
    });

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log(`✅ Notificaciones enviadas a ${messages.length} usuarios`);
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
    const notifications = notificationsStore
      .filter(n => n.userId === userId)
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, 50);

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// Obtener todos los usuarios con tokens registrados
app.get('/api/notifications/users', async (req, res) => {
  try {
    const users = Array.from(tokensStore.values()).map(token => ({
      userId: token.userId,
      email: token.email,
      deviceInfo: token.deviceInfo,
      updatedAt: token.updatedAt,
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    storage: 'memory',
    users: tokensStore.size,
    notifications: notificationsStore.length
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor de notificaciones corriendo en puerto ${PORT}`);
  console.log(`📊 Almacenamiento: Memoria (temporal)`);
  console.log(`💡 Para persistencia, instala Node.js v20 LTS\n`);
});
