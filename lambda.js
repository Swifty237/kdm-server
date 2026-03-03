const serverless = require('aws-serverless-express');
const { createServer } = require('aws-serverless-express');
const app = require('./server.js');

const server = createServer(app);

const handler = (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return serverless.proxy(server, event, context);
};

module.exports = handler;