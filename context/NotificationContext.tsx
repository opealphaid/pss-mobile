import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { handleNotificationNavigation } from '@/utils/notificationNavigation';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { flashlightService } from '@/services/flashlightService';
import { registerBackgroundNotificationTask } from '@/utils/backgroundNotifications';

type NotificationSubscription = ReturnType<typeof Notifications.addNotificationReceivedListener>;

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  notifications: Notifications.Notification[];
  stopAlarm: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification debe usarse dentro de un NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const vibrationRef = useRef<NodeJS.Timeout | null>(null);

  const notificationListener = useRef<NotificationSubscription | null>(null);
  const responseListener = useRef<NotificationSubscription | null>(null);

  const stopAlarm = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    if (vibrationRef.current) {
      clearInterval(vibrationRef.current);
      vibrationRef.current = null;
    }
    await flashlightService.stop();
  };

  useEffect(() => {
    // Registrar tarea en background
    registerBackgroundNotificationTask();
    
    // Cargar notificaciones guardadas
    AsyncStorage.getItem('notifications').then(data => {
      if (data) setNotifications(JSON.parse(data));
    });

    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
        console.log('Token registrado:', token);
      },
      (error) => setError(error)
    );

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('Notificación recibida: ', notification);
      setNotification(notification);
      
      // Guardar en historial
      AsyncStorage.getItem('notifications').then(async (data) => {
        const existing = data ? JSON.parse(data) : [];
        const newNotifications = [notification, ...existing].slice(0, 50);
        setNotifications(newNotifications);
        await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
      });
      
      const data = notification.request.content.data;
      
      // Si es urgente, iniciar alarma continua
      if (data?.alarm || data?.type === 'urgent') {
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: false,
            interruptionModeIOS: 2, // Do not mix
            interruptionModeAndroid: 1, // Do not mix
          });
          
          // Sonido en loop con volumen máximo
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
            { 
              shouldPlay: true, 
              volume: 1.0, 
              isLooping: true,
              isMuted: false,
              rate: 1.0,
              shouldCorrectPitch: true,
            }
          );
          soundRef.current = sound;
          
          // Vibración intensa continua cada 500ms
          vibrationRef.current = setInterval(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 500);
          
          // Activar linterna parpadeante
          await flashlightService.startFlashing();
          
        } catch (error) {
          console.log('Error iniciando alarma:', error);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Respuesta a notificación: ', JSON.stringify(data, null, 2));
      
      // Detener alarma cuando el usuario toca la notificación
      stopAlarm();
      
      handleNotificationNavigation(data);
    });

    return () => {
      stopAlarm();
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error, notifications, stopAlarm }}>
      {children}
    </NotificationContext.Provider>
  );
};
