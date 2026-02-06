import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_NOTIFICATION_SERVICE } from '../constants/api';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export const notificationService = {
  async registerToken(expoPushToken: string): Promise<void> {
    const userId = await AsyncStorage.getItem('userId');
    const email = await AsyncStorage.getItem('email');
    
    if (!userId) {
      console.warn('No se puede registrar token: usuario no autenticado');
      return;
    }

    const deviceInfo = {
      platform: Platform.OS,
      model: Device.modelName,
      osVersion: Device.osVersion,
    };

    const url = `${PATH_NOTIFICATION_SERVICE}/notifications/register-token`;
    console.log('📤 Enviando token a:', url);
    console.log('UserId:', userId);
    console.log('Email:', email);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          expoPushToken,
          deviceInfo,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('Error al registrar token');
      }

      const result = await response.json();
      console.log('✅ Respuesta del servidor:', result);
    } catch (error) {
      console.error('❌ Error registrando token:', error);
      throw error;
    }
  },

  async sendNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      const response = await fetch(`${PATH_NOTIFICATION_SERVICE}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, body, data }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar notificación');
      }
    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  },
};
