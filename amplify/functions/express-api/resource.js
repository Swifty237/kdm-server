import { defineFunction } from "@aws-amplify/backend";

export const expressApi = defineFunction({
    name: "express-api",
    entry: "./src/handler.js",  // Point d'entrée mis à jour
    timeoutSeconds: 30,
    memoryMB: 512,  // Augmentez la mémoire pour MongoDB/Resend
});