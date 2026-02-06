import Torch from 'react-native-torch';

class FlashlightService {
  private flashInterval: NodeJS.Timeout | null = null;

  async startFlashing() {
    try {
      // Verificar si el dispositivo tiene linterna
      const isTorchAvailable = await Torch.isTorchAvailable();
      if (!isTorchAvailable) {
        console.log('Dispositivo no tiene linterna');
        return;
      }

      // Parpadeo cada 500ms
      let isOn = false;
      this.flashInterval = setInterval(async () => {
        isOn = !isOn;
        await Torch.switchState(isOn);
      }, 500);
      
      console.log('✅ Linterna parpadeando');
    } catch (error) {
      console.log('⚠️ Error activando linterna:', error);
    }
  }

  async stop() {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
    try {
      await Torch.switchState(false);
      console.log('✅ Linterna apagada');
    } catch (error) {
      console.log('Error apagando linterna:', error);
    }
  }
}

export const flashlightService = new FlashlightService();
