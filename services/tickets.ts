import AsyncStorage from '@react-native-async-storage/async-storage';
import { PATH_URL_BACKEND } from '../constants/api';
import { Ticket, DashboardData } from '../types';

export const ticketService = {
  async getDashboardData(): Promise<DashboardData> {
    const solicitanteId = await AsyncStorage.getItem('userId');
    if (!solicitanteId) throw new Error('No se encontró el solicitanteId');

    const response = await fetch(`${PATH_URL_BACKEND}/dashboard/cliente/${solicitanteId}`);
    if (!response.ok) throw new Error('Error al obtener los datos del dashboard');
    
    return await response.json();
  },

  async getTickets(filters: any, tipoTicket: 'normal' | 'foi' = 'normal'): Promise<Ticket[]> {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('No se encontró el ID del usuario');

    const endpoint = tipoTicket === 'normal'
      ? `${PATH_URL_BACKEND}/tickets/normal/cliente-filter/${userId}`
      : `${PATH_URL_BACKEND}/tickets/foi/cliente-filter/${userId}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error('Error al obtener tickets');

    const data = await response.json();
    return data.sort((a: Ticket, b: Ticket) => {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });
  },

  async getCategorias() {
    const response = await fetch(`${PATH_URL_BACKEND}/categorias`);
    return await response.json();
  },

  async getPrioridades() {
    const response = await fetch(`${PATH_URL_BACKEND}/prioridades`);
    return await response.json();
  },

  async getCiudades() {
    const response = await fetch(`${PATH_URL_BACKEND}/ciudad`);
    return await response.json();
  },
};
