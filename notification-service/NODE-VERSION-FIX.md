# 🔴 Problema: Node.js v23 + MongoDB SSL Error

## ⚠️ Causa
Node.js v23.7.0 tiene problemas de compatibilidad con MongoDB Atlas y OpenSSL.

## ✅ SOLUCIÓN RECOMENDADA: Usar Node.js v20 LTS

### Opción 1: Instalar Node.js v20 LTS (Recomendado)

1. Descarga Node.js v20 LTS desde: https://nodejs.org/
2. Instala la versión LTS (v20.x.x)
3. Reinicia la terminal
4. Verifica: `node --version` (debería mostrar v20.x.x)
5. Ejecuta: `npm start`

### Opción 2: Usar NVM (Node Version Manager)

```bash
# Instalar NVM desde: https://github.com/coreybutler/nvm-windows

# Instalar Node.js v20
nvm install 20

# Usar Node.js v20
nvm use 20

# Verificar
node --version

# Iniciar servidor
npm start
```

### Opción 3: Usar MongoDB Local (Temporal)

Si no puedes cambiar Node.js ahora, usa MongoDB local:

1. Instala MongoDB Community: https://www.mongodb.com/try/download/community
2. Actualiza `.env`:
```
MONGODB_URI=mongodb://localhost:27017/Clients
PORT=3001
```
3. Ejecuta: `npm start`

## 🎯 Verificación

Después de cambiar a Node.js v20:

```bash
node --version  # Debe mostrar v20.x.x
cd notification-service
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB - Base de datos: Clients
🚀 Servidor de notificaciones corriendo en puerto 3001
```

## 📝 Nota

Node.js v23 es muy reciente y tiene problemas de compatibilidad. 
Node.js v20 LTS es la versión estable recomendada para producción.
