# Solución al Error de SSL/TLS con MongoDB

## 🔧 Problema
Error: `SSL routines:ssl3_read_bytes:tlsv1 alert internal error`

## ✅ Soluciones

### Opción 1: Downgrade de MongoDB Driver (Recomendado)

```bash
cd notification-service
npm uninstall mongodb
npm install mongodb@5.9.0
npm start
```

### Opción 2: Usar Variable de Entorno NODE_OPTIONS

```bash
set NODE_OPTIONS=--tls-min-v1.0
npm start
```

O en PowerShell:
```powershell
$env:NODE_OPTIONS="--tls-min-v1.0"
npm start
```

### Opción 3: Actualizar Node.js

Si usas Node.js antiguo, actualiza a la versión LTS más reciente:
https://nodejs.org/

### Opción 4: Verificar IP en MongoDB Atlas

1. Ve a https://cloud.mongodb.com
2. Network Access
3. Agrega tu IP actual o usa `0.0.0.0/0` (permite todas)

## 🚀 Prueba Rápida

```bash
cd notification-service
npm install mongodb@5.9.0
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB - Base de datos: Clients
🚀 Servidor de notificaciones corriendo en puerto 3001
```
