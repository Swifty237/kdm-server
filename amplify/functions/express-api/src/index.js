import serverless from 'aws-serverless-express';
import { createServer } from 'aws-serverless-express';
import app from './app.js';

console.log('🚀 Initialisation du serveur Express...');

const server = createServer(app);

export const handler = (event, context) => {
    console.log('📦 Lambda handler appelé');
    context.callbackWaitsForEmptyEventLoop = false;
    return serverless.proxy(server, event, context, 'PROMISE').promise;
};

console.log('✅ Serveur Express prêt');