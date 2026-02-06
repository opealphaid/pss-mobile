"""
Función para enviar notificaciones push desde Python

Instalación:
pip install requests
"""

import requests
import json

def enviar_notificacion(expo_push_token, title, body, data=None, channel_id='default'):
    """
    Envía una notificación push a un usuario
    
    Args:
        expo_push_token (str): Token de Expo del usuario
        title (str): Título de la notificación
        body (str): Cuerpo del mensaje
        data (dict): Datos adicionales (ticketId, type, etc)
        channel_id (str): Canal de notificación
        
    Returns:
        dict: Resultado del envío
    """
    if data is None:
        data = {}
    
    message = {
        'to': expo_push_token,
        'sound': 'default',
        'title': title,
        'body': body,
        'data': data,
        'priority': 'high',
        'channelId': channel_id,
    }
    
    try:
        response = requests.post(
            'https://exp.host/--/api/v2/push/send',
            headers={
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            json=message
        )
        
        result = response.json()
        
        if response.status_code == 200 and result.get('data', {}).get('status') == 'ok':
            print('✅ Notificación enviada exitosamente')
            return {'success': True, 'data': result['data']}
        else:
            print(f'❌ Error enviando notificación: {result}')
            return {'success': False, 'error': result}
            
    except Exception as e:
        print(f'❌ Error de conexión: {e}')
        return {'success': False, 'error': str(e)}


def enviar_notificacion_masiva(tokens, title, body, data=None, channel_id='default'):
    """
    Envía notificaciones a múltiples usuarios
    
    Args:
        tokens (list): Lista de tokens de Expo
        title (str): Título de la notificación
        body (str): Cuerpo del mensaje
        data (dict): Datos adicionales
        channel_id (str): Canal de notificación
        
    Returns:
        dict: Resultado del envío
    """
    if data is None:
        data = {}
    
    messages = [
        {
            'to': token,
            'sound': 'default',
            'title': title,
            'body': body,
            'data': data,
            'priority': 'high',
            'channelId': channel_id,
        }
        for token in tokens
    ]
    
    try:
        response = requests.post(
            'https://exp.host/--/api/v2/push/send',
            headers={
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            json=messages
        )
        
        result = response.json()
        print(f'✅ Notificaciones enviadas a {len(tokens)} usuarios')
        return {'success': True, 'data': result}
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return {'success': False, 'error': str(e)}


# Ejemplo de uso
if __name__ == '__main__':
    token = 'ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]'
    
    resultado = enviar_notificacion(
        token,
        'Nuevo Ticket Asignado',
        'Ticket #456 requiere tu atención',
        {'ticketId': 456, 'type': 'new_ticket'},
        'urgent-notifications'
    )
    
    print(resultado)
