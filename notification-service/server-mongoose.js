require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(cors());
app.use(express.json());

// Schemas de Mongoose
const pushTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: String,
  expoPushToken: String,
  deviceInfo: Object,
  updatedAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  body: String,
  data: Object,
  sent: Boolean,
  sentAt: { type: Date, default: Date.now },
  tickets: Array
});

const PushToken = mongoose.model('PushToken', pushTokenSchema, 'pushTokens');
const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

// Conectar a MongoDB
const MONGODB_URI = 'mongodb+srv://urdinic_db_user:79sF9wa8CQOYvZqC@clusteralphanotificatio.agju2dg.mongodb.net/Clients?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas - Base de datos: Clients');
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  });

// Registrar token de dispositivo
app.post('/api/notifications/register-token', async (req, res) => {
  console.log('📥 Petición recibida en /register-token');
  console.log('Body:', req.body);
  
  try {
    const { userId, email, expoPushToken, deviceInfo } = req.body;

    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.log('❌ Token inválido:', expoPushToken);
      return res.status(400).json({ error: 'Token inválido' });
    }

    await PushToken.findOneAndUpdate(
      { userId },
      { userId, email, expoPushToken, deviceInfo, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`✅ Token registrado para usuario ${userId} (${email})`);
    res.json({ success: true, message: 'Token registrado' });
  } catch (error) {
    console.error('❌ Error registrando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Enviar notificación a un usuario
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    const tokenDoc = await PushToken.findOne({ userId });
    
    if (!tokenDoc) {
      return res.status(404).json({ error: 'Token no encontrado para el usuario' });
    }

    const messages = [{
      to: tokenDoc.expoPushToken,
      sound: 'default',
      title,
      body,
      data: { 
        ...(data || {}),
        image: 'https://i.imgur.com/placeholder.png' // Reemplazar con URL de tu logo
      },
      priority: 'high'
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    await Notification.create({
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

    const tokens = await PushToken.find({ userId: { $in: userIds } });

    const messages = tokens.map(token => ({
      to: token.expoPushToken,
      sound: 'default',
      title,
      body,
      data: { 
        ...(data || {}),
        image: 'https://i.imgur.com/placeholder.png' // Reemplazar con URL de tu logo
      },
      priority: 'high'
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
    const notifications = await Notification.find({ userId })
      .sort({ sentAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// Obtener todos los usuarios con tokens registrados
app.get('/api/notifications/users', async (req, res) => {
  try {
    const users = await PushToken.find({}, { userId: 1, email: 1, deviceInfo: 1, updatedAt: 1 });
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor de notificaciones corriendo en puerto ${PORT}\n`);
});
