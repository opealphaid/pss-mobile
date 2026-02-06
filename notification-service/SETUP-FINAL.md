# ✅ Sistema de Notificaciones - Configuración Final

## 🗄️ Base de Datos MongoDB

- **Cluster:** ClusterAlphaNotifications
- **Base de Datos:** Clients
- **Colecciones:** pushTokens, notifications

## 🚀 Pasos de Configuración

### 1. Instalar Dependencias

```bash
cd notification-service
npm install
```

### 2. Inicializar Base de Datos (Opcional)

```bash
npm run init-db
```

Esto crea las colecciones y los índices en MongoDB.

### 3. Iniciar Servidor

```bash
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB - Base de datos: Clients
🚀 Servidor de notificaciones corriendo en puerto 3001
```

### 4. Registrar Usuario

El cliente debe:
1. Abrir la app PSS Mobile
2. Iniciar sesión
3. Su token se guarda automáticamente en MongoDB (colección `pushTokens`)

### 5. Verificar Registro

```bash
npm run users
```

Deberías ver el usuario registrado.

### 6. Enviar Notificación

**Opción A: Desde el proyecto raíz**
```bash
cd ..
npm run notify <userId>
```

**Opción B: Desde el servicio**
```bash
node test-send.js <userId>
```

**Opción C: Panel Web**
Abre `panel.html` en tu navegador.

## 📊 Verificar en MongoDB Atlas

1. Ve a https://cloud.mongodb.com
2. Navega a ClusterAlphaNotifications
3. Click en "Browse Collections"
4. Verás la base de datos "Clients" con:
   - `pushTokens` - Tokens de usuarios
   - `notifications` - Historial de notificaciones

## 🔍 Comandos Útiles

```bash
# Ver usuarios registrados
npm run users

# Ver tokens completos
npm run list-tokens

# Inicializar/verificar base de datos
npm run init-db

# Enviar notificación de prueba
node test-send.js <userId>
```

## ⚠️ Nota Importante

MongoDB crea la base de datos automáticamente cuando insertas el primer documento. Si no ves "Clients" en MongoDB Atlas, es porque aún no hay datos. 

**Solución:** Haz que un usuario inicie sesión en la app y el token se guardará automáticamente.

## ✅ Verificación Completa

1. ✅ Servidor corriendo en puerto 3001
2. ✅ Usuario inicia sesión en la app
3. ✅ Token guardado en MongoDB (colección pushTokens)
4. ✅ Enviar notificación de prueba
5. ✅ Usuario recibe notificación en su dispositivo

## 🌐 Estructura Final

```
ClusterAlphaNotifications/
└── Clients/
    ├── pushTokens/
    │   └── { userId, email, expoPushToken, deviceInfo }
    └── notifications/
        └── { userId, title, body, data, sentAt }
```

¡Todo listo para usar! 🎉
