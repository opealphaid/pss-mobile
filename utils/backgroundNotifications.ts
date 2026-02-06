import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Configurar cómo se manejan las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isUrgent = data?.alarm || data?.type === 'urgent';

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: isUrgent ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

// Definir tarea en background
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Error en tarea background:', error);
    return;
  }

  if (data) {
    const notification = data as any;
    const notificationData = notification.notification?.request?.content?.data;

    // Si es urgente, reproducir alarma incluso en background
    if (notificationData?.alarm || notificationData?.type === 'urgent') {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          interruptionModeIOS: 2,
          interruptionModeAndroid: 1,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
          { 
            shouldPlay: true, 
            volume: 1.0, 
            isLooping: true,
            isMuted: false,
          }
        );

        // Vibrar intensamente
        const vibrateInterval = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 500);

        // Detener después de 60 segundos si no se interactúa
        setTimeout(async () => {
          clearInterval(vibrateInterval);
          await sound.stopAsync();
          await sound.unloadAsync();
        }, 60000);

      } catch (error) {
        console.log('Error reproduciendo alarma en background:', error);
      }
    }
  }
});

// Registrar tarea en background
export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('✅ Tarea de notificaciones en background registrada');
  } catch (error) {
    console.log('⚠️ No se pudo registrar tarea en background:', error);
  }
}
