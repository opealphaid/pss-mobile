import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Camera } from 'expo-camera';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

class AlarmService {
  private sound: Audio.Sound | null = null;
  private vibrationInterval: NodeJS.Timeout | null = null;
  private flashInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  async start() {
    if (this.isActive) return;
    this.isActive = true;

    try {
      // Mantener pantalla encendida
      await activateKeepAwakeAsync();

      // Configurar audio para reproducir en silencio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Reproducir alarma en loop
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/alarm.mp3'),
        { shouldPlay: true, volume: 1.0, isLooping: true }
      );
      this.sound = sound;

      // Vibración continua
      this.vibrationInterval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 500);

      // Linterna parpadeante
      this.startFlashlight();

    } catch (error) {
      console.error('Error iniciando alarma:', error);
    }
  }

  async startFlashlight() {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        this.flashInterval = setInterval(async () => {
          // Alternar linterna
          // Nota: Expo no tiene API directa para linterna, se necesita módulo nativo
        }, 500);
      }
    } catch (error) {
      console.log('No se pudo activar linterna:', error);
    }
  }

  async stop() {
    this.isActive = false;

    // Detener sonido
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }

    // Detener vibración
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }

    // Detener linterna
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }

    // Permitir que la pantalla se apague
    deactivateKeepAwake();
  }
}

export const alarmService = new AlarmService();
