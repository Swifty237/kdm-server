import serverless from 'aws-serverless-express';
import { createServer } from 'aws-serverless-express';
import app from './server.js';

const server = createServer(app);

export const handler = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return serverless.proxy(server, event, context);
};