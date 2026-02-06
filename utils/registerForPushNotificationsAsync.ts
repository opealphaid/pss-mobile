/*  */import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isUrgent = data?.alarm || data?.type === 'urgent';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: isUrgent 
        ? Notifications.AndroidNotificationPriority.MAX 
        : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('urgent-notifications', {
      name: 'Notificaciones Urgentes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 500, 500, 500, 500],
      lightColor: '#FF0000',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        flags: {
          enforceAudibleAlert: true,
        },
      },
    });
    
    // Canal de alarma crítica
    await Notifications.setNotificationChannelAsync('critical-alarm', {
      name: 'Alarma Crítica',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000, 1000, 1000],
      lightColor: '#FF0000',
      sound: 'alarm',
      enableVibrate: true,
      enableLights: true,
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        flags: {
          enforceAudibleAlert: true,
        },
      },
    });
    
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('No se otorgaron permisos para recibir notificaciones push');
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    try {
      const pushTokenString = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
      console.log('Push token:', pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`Error generando push token: ${e}`);
    }
  } else {
    throw new Error('Se necesita un dispositivo físico para las notificaciones push');
  }
}
