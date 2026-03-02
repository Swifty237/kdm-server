import serverless from 'aws-serverless-express';
import { createServer } from 'aws-serverless-express';
import app from './app.js';

const server = createServer(app);

export const handler = async (event, context) => {
    console.log('🚀 Lambda invoquée avec event:', JSON.stringify(event));
    context.callbackWaitsForEmptyEventLoop = false;
    return serverless.proxy(server, event, context, 'PROMISE').promise;
};