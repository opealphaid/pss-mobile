import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_URL_BACKEND } from '../constants/api';
import { Usuario } from '../types';

export const userService = {
  async getProfile(): Promise<Usuario> {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('No se encontró el ID del usuario');

    const response = await fetch(`${PATH_URL_BACKEND}/usuario/${userId}`);
    if (!response.ok) throw new Error('Error al obtener el usuario');
    
    return await response.json();
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('No se pudo obtener el ID de usuario');

    const response = await fetch(`${PATH_URL_BACKEND}/usuario/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario: userId,
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al cambiar la contraseña');
    }
  },
};
