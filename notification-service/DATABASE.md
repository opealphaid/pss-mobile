# 🗄️ Configuración de Base de Datos

## 📊 Estructura en MongoDB

**Cluster:** ClusterAlphaNotifications
**Base de Datos:** Clients

### Colecciones:

#### 1. pushTokens
Almacena los tokens de notificación de los usuarios.

```json
{
  "_id": ObjectId,
  "userId": "123",
  "email": "user@example.com",
  "expoPushToken": "ExponentPushToken[...]",
  "deviceInfo": {
    "platform": "android",
    "model": "Pixel 6",
    "osVersion": "13"
  },
  "updatedAt": ISODate
}
```

#### 2. notifications
Historial de notificaciones enviadas.

```json
{
  "_id": ObjectId,
  "userId": "123",
  "title": "Nuevo Ticket",
  "body": "Ticket #456 asignado",
  "data": {
    "ticketId": 456,
    "type": "new_ticket"
  },
  "sent": true,
  "sentAt": ISODate,
  "tickets": []
}
```

## 🚀 Inicializar Base de Datos

```bash
cd notification-service
npm run init-db
```

Esto creará:
- ✅ Base de datos "Clients"
- ✅ Colección "pushTokens"
- ✅ Colección "notifications"
- ✅ Índices optimizados

## ✅ Verificar en MongoDB Atlas

1. Ve a https://cloud.mongodb.com
2. Navega a tu cluster: ClusterAlphaNotifications
3. Click en "Browse Collections"
4. Deberías ver la base de datos "Clients" con las colecciones

## 📝 Nota Importante

MongoDB crea automáticamente la base de datos y colecciones cuando insertas el primer documento. Si no ves la base de datos "Clients", es porque aún no hay datos. 

Para crear el primer registro:
1. Inicia el servidor: `npm start`
2. Abre la app móvil
3. Inicia sesión
4. El token se guardará automáticamente en MongoDB

## 🔍 Ver Datos

```bash
# Ver usuarios registrados
npm run users

# Ver todos los tokens
npm run list-tokens
```

## 🌐 Acceso desde MongoDB Atlas

Puedes ver y gestionar los datos directamente desde MongoDB Atlas:
- URL: https://cloud.mongodb.com
- Cluster: ClusterAlphaNotifications
- Database: Clients
- Collections: pushTokens, notifications
