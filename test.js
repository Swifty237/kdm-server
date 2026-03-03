// test.js - À exécuter en local
import app from './amplify/functions/express-api/src/app.js';
import express from 'express';

// Crée un serveur Express normal
const localApp = express();
localApp.use(app);

localApp.listen(3001, () => {
    console.log('✅ Serveur de test sur http://localhost:3001');
    console.log('Testez avec: curl http://localhost:3001/api/contact -X POST -H "Content-Type: application/json" -d \'{"nom":"Test","email":"test@test.com","message":"test"}\'');
});