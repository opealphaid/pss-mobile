import { Platform } from 'react-native';
import Torch from 'react-native-torch';

class FlashlightService {
  private flashInterval: NodeJS.Timeout | null = null;
  private isFlashing = false;

  async startFlashing() {
    if (this.isFlashing) return;
    
    try {
      if (Platform.OS !== 'android') {
        console.log('⚠️ Linterna solo disponible en Android');
        return;
      }

      const isTorchAvailable = await Torch.isTorchAvailable();
      if (!isTorchAvailable) {
        console.log('⚠️ Dispositivo no tiene linterna');
        return;
      }

      this.isFlashing = true;
      let isOn = false;
      this.flashInterval = setInterval(async () => {
        try {
          isOn = !isOn;
          await Torch.switchState(isOn);
        } catch (error) {
          console.log('Error en parpadeo:', error);
        }
      }, 500);
      
      console.log('✅ Linterna parpadeando');
    } catch (error) {
      console.log('⚠️ Error activando linterna:', error);
      this.isFlashing = false;
    }
  }

  async stop() {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
    this.isFlashing = false;
    
    try {
      if (Platform.OS === 'android') {
        await Torch.switchState(false);
      }
      console.log('✅ Linterna apagada');
    } catch (error) {
      console.log('Error apagando linterna:', error);
    }
  }
}

export const flashlightService = new FlashlightService();
