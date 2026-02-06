import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '@/context/NotificationContext';

export default function TestNotification() {
  const { expoPushToken } = useNotification();
  const [loading, setLoading] = useState(false);

  const sendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Prueba PSS Mobile",
        body: 'Esta es una notificación local con sonido y vibración',
        data: { ticketId: 123 },
        sound: true,
      },
      trigger: null,
    });
  };

  const sendRemoteNotification = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Debes iniciar sesión primero');
        return;
      }

      await notificationService.sendNotification(
        userId,
        '🔔 Notificación Remota',
        'Esta notificación viene desde el servidor MongoDB',
        { type: 'test', timestamp: new Date().toISOString() }
      );

      Alert.alert('✅ Éxito', 'Notificación enviada desde el servidor');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo enviar la notificación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Notificaciones</Text>
      
      {expoPushToken && (
        <Text style={styles.token}>Token: {expoPushToken.substring(0, 30)}...</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title="📱 Notificación Local" 
          onPress={sendLocalNotification} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="☁️ Notificación Remota (MongoDB)" 
          onPress={sendRemoteNotification}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  token: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 8,
  },
});
