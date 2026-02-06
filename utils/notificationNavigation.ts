import { router } from 'expo-router';

/**
 * Maneja la navegación cuando el usuario toca una notificación
 */
export function handleNotificationNavigation(data: any) {
  if (!data) return;

  switch (data.type) {
    case 'new_ticket':
    case 'status_change':
    case 'new_comment':
    case 'assignment':
    case 'urgent':
      // Navegar a la lista de tickets
      router.push('/(tabs)/tickets');
      break;

    case 'reminder':
      router.push('/(tabs)/tickets');
      break;

    case 'team':
    case 'meeting':
      router.push('/(tabs)/home');
      break;

    default:
      // Por defecto ir a home
      router.push('/(tabs)/home');
  }
}
