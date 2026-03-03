const awsServerlessExpress = require('aws-serverless-express');
const app = require('./app');  // Important: ./app, pas ./server.js

console.log('🔍 Chargement de app.js...');

let server;
try {
  server = awsServerlessExpress.createServer(app);
  console.log('✅ Serveur Express créé avec succès');
} catch (error) {
  console.error('❌ Erreur création serveur:', error);
  throw error;
}

exports.handler = (event, context) => {
  console.log(`📦 Lambda handler appelé pour: ${event.path}`);
  context.callbackWaitsForEmptyEventLoop = false;
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};