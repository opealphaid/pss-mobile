export interface LoginResponse {
  id: string;
  nombre: string;
  password: string;
  email: string;
  rol: string;
  idDepartamento: string;
  activo: boolean;
  requireChangePwd: boolean;
  principalContact: boolean;
  empresaId: string;
  primerLogin: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  idDepartamento: string;
  empresa: string;
  regional: string;
  activo: boolean;
  requireChangePwd: boolean;
}

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad?: any;
  categoria: any;
  fechaCreacion: string;
  fechaCierre?: string;
  solicitanteId: string;
  tecnicoId?: string;
  ciudadId: string;
}

export interface DashboardData {
  ticketsSolicitados: number;
  ticketsCerrados: number;
  ticketsEnCurso: number;
  sinAsignar: number;
  ticketsPorEstado: Record<string, number>;
  ticketsCreadosPorMes: Record<string, number>;
}
