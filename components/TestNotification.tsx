import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function TestNotification() {
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

  return (
    <View style={styles.container}>
      <Button title="Enviar Notificación Local" onPress={sendLocalNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
