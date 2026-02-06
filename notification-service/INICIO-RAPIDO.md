# ⚡ Inicio Rápido - 3 Pasos

## 1️⃣ Iniciar Servidor (Una sola vez)

```bash
cd notification-service
npm install
npm start
```

Deberías ver:
```
✅ Conectado a MongoDB
🚀 Servidor de notificaciones corriendo en puerto 3001
```

## 2️⃣ Cliente Inicia Sesión en la App

El cliente abre la app PSS Mobile y hace login.
Su token se guarda automáticamente en MongoDB.

## 3️⃣ Enviar Notificación desde la Web

### Opción A: Panel Web (Recomendado)
Abre en tu navegador:
```
notification-service/panel.html
```

- Verás la lista de usuarios conectados
- Selecciona un usuario
- Escribe el mensaje
- Envía

### Opción B: Desde Terminal
```bash
node test-send.js <userId>
```

### Opción C: Desde tu Código Web
```javascript
fetch('http://localhost:3001/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '123',
    title: 'Nuevo Ticket',
    body: 'Ticket #456 asignado',
    data: { ticketId: 456 }
  })
});
```

## ✅ ¡Listo!

El cliente recibe la notificación en su app móvil (iOS o Android).

---

## 📋 Comandos Útiles

```bash
# Ver usuarios registrados
npm run users

# Ver tokens completos
npm run list-tokens

# Enviar notificación de prueba
node test-send.js <userId>
```

## 🌐 Archivos Web

- **panel.html** - Panel completo con lista de usuarios
- **web-sender.html** - Formulario simple

## 📚 Más Información

- `FLUJO-WEB.md` - Guía completa del flujo web
- `README.md` - Documentación completa de la API
- `integration-examples.js` - Ejemplos de código
