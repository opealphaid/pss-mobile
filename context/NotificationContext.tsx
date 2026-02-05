import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

type NotificationSubscription = ReturnType<typeof Notifications.addNotificationReceivedListener>;

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
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
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<NotificationSubscription | null>(null);
  const responseListener = useRef<NotificationSubscription | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
        console.log('Token registrado:', token);
      },
      (error) => setError(error)
    );

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida: ', notification);
      setNotification(notification);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Respuesta a notificación: ', JSON.stringify(response.notification.request.content.data, null, 2));
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
