import serverless from 'aws-serverless-express';
import { createServer } from 'aws-serverless-express';
import app from './app.js';

console.log('🚀 Initialisation du serveur Express...');

// Création du serveur AWS Serverless Express
const server = createServer(app);

// Handler Lambda
export const handler = (event, context) => {
    console.log('📦 Lambda handler appelé');
    console.log('📦 Méthode:', event.httpMethod);
    console.log('📦 Path:', event.path);

    // Important pour les connexions à la base de données
    context.callbackWaitsForEmptyEventLoop = false;

    // Proxifier la requête vers Express
    return serverless.proxy(server, event, context, 'PROMISE').promise;
};

// Log de confirmation
console.log('✅ Serveur Express prêt à recevoir des requêtes');