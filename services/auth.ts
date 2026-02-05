import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_URL_BACKEND } from '../constants/api';
import { LoginResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${PATH_URL_BACKEND}/usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Usuario o contraseña incorrectos.');
    }

    const user: LoginResponse = await response.json();
    
    // Guardar datos del usuario
    await AsyncStorage.multiSet([
      ['userId', user.id],
      ['fullname', user.nombre],
      ['email', user.email],
      ['userRole', user.rol],
      ['idDepartamento', user.idDepartamento],
      ['puntoContacto', user.principalContact.toString()],
      ['idEmpresa', user.empresaId],
      ['primerLogin', user.primerLogin.toString()],
    ]);

    return user;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      'userId',
      'fullname',
      'email',
      'userRole',
      'idDepartamento',
      'puntoContacto',
      'idEmpresa',
      'primerLogin',
    ]);
  },

  async getUserData(): Promise<Record<string, string | null>> {
    const keys = ['userId', 'fullname', 'email', 'userRole', 'idDepartamento', 'puntoContacto', 'idEmpresa', 'primerLogin'];
    const values = await AsyncStorage.multiGet(keys);
    return Object.fromEntries(values);
  },

  async isAuthenticated(): Promise<boolean> {
    const userId = await AsyncStorage.getItem('userId');
    return !!userId;
  },
};
