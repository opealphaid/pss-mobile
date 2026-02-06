<?php
/**
 * Función para enviar notificaciones push desde PHP
 */

/**
 * Envía una notificación push a un usuario
 * 
 * @param string $expoPushToken Token de Expo del usuario
 * @param string $title Título de la notificación
 * @param string $body Cuerpo del mensaje
 * @param array $data Datos adicionales (ticketId, type, etc)
 * @param string $channelId Canal de notificación
 * @return array Resultado del envío
 */
function enviarNotificacion($expoPushToken, $title, $body, $data = [], $channelId = 'default') {
    $message = [
        'to' => $expoPushToken,
        'sound' => 'default',
        'title' => $title,
        'body' => $body,
        'data' => $data,
        'priority' => 'high',
        'channelId' => $channelId,
    ];

    $ch = curl_init('https://exp.host/--/api/v2/push/send');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode === 200 && isset($result['data']['status']) && $result['data']['status'] === 'ok') {
        error_log('✅ Notificación enviada exitosamente');
        return ['success' => true, 'data' => $result['data']];
    } else {
        error_log('❌ Error enviando notificación: ' . $response);
        return ['success' => false, 'error' => $result];
    }
}

/**
 * Envía notificaciones a múltiples usuarios
 * 
 * @param array $tokens Array de tokens de Expo
 * @param string $title Título de la notificación
 * @param string $body Cuerpo del mensaje
 * @param array $data Datos adicionales
 * @param string $channelId Canal de notificación
 * @return array Resultado del envío
 */
function enviarNotificacionMasiva($tokens, $title, $body, $data = [], $channelId = 'default') {
    $messages = [];
    foreach ($tokens as $token) {
        $messages[] = [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'priority' => 'high',
            'channelId' => $channelId,
        ];
    }

    $ch = curl_init('https://exp.host/--/api/v2/push/send');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($messages));

    $response = curl_exec($ch);
    curl_close($ch);

    error_log('✅ Notificaciones enviadas a ' . count($tokens) . ' usuarios');
    return ['success' => true, 'data' => json_decode($response, true)];
}

// Ejemplo de uso
if (php_sapi_name() === 'cli') {
    $token = 'ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]';
    
    $resultado = enviarNotificacion(
        $token,
        'Nuevo Ticket Asignado',
        'Ticket #456 requiere tu atención',
        ['ticketId' => 456, 'type' => 'new_ticket'],
        'urgent-notifications'
    );
    
    print_r($resultado);
}
?>
