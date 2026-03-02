import serverless from 'aws-serverless-express';
import { createServer } from 'aws-serverless-express';
import server from './server.js';

const app = createServer(server);

export const handler = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return serverless.proxy(app, event, context);
};