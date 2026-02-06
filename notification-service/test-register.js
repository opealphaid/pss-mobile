const fetch = require('node-fetch');

const testData = {
  userId: '08e9854b-fbb9-445f-af84-1c38a80e2d0a',
  email: 'alextintor680031@gmail.com',
  expoPushToken: 'ExponentPushToken[6Knw8EJqbdr43Tp6bbxaOR]',
  deviceInfo: {
    platform: 'android',
    model: 'Test Device',
    osVersion: '13'
  }
};

console.log('🧪 Probando registro de token...\n');
console.log('URL: http://localhost:3001/api/notifications/register-token');
console.log('Datos:', JSON.stringify(testData, null, 2));
console.log('');

fetch('http://localhost:3001/api/notifications/register-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Respuesta:', data);
    console.log('\n💡 Ahora ejecuta: npm run users');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
