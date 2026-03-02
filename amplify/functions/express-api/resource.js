import { defineFunction } from "@aws-amplify/backend";

export const expressApi = defineFunction({
    name: "express-api",
    entry: "./handler.js",
    timeoutSeconds: 30,
    memoryMB: 1024,
});