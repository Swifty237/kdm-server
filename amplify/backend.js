import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Duration } from "aws-cdk-lib";
import { expressApi } from "./functions/express-api/resource.js";

const backend = defineBackend({
    expressApi,
});

const apiStack = backend.createStack("api-stack");

const httpApi = new HttpApi(apiStack, "HttpApi", {
    apiName: "kdm-express-api",
    corsPreflight: {
        allowMethods: [
            CorsHttpMethod.GET,
            CorsHttpMethod.POST,
            CorsHttpMethod.PUT,
            CorsHttpMethod.DELETE,
            CorsHttpMethod.OPTIONS,
            CorsHttpMethod.PATCH,
        ],
        allowOrigins: [
            process.env.KDM_PROJECT_FRONT_URI || "*",
            process.env.KDM_GESTION_FRONT_URI || "",
        ],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: Duration.seconds(86400), // ✅ Correction avec Duration
    },
    createDefaultStage: true,
});

// Définir HttpMethod manuellement car il peut poser problème
const HttpMethod = {
    ANY: 'ANY',
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    OPTIONS: 'OPTIONS'
};

const lambdaIntegration = new HttpLambdaIntegration(
    "express-integration",
    backend.expressApi.resources.lambda
);

httpApi.addRoutes({
    path: "/api/{proxy+}",
    methods: [HttpMethod.ANY],
    integration: lambdaIntegration,
});

// Optionnel : ajouter aussi la route racine
httpApi.addRoutes({
    path: "/{proxy+}",
    methods: [HttpMethod.ANY],
    integration: lambdaIntegration,
});

backend.addOutput({
    custom: {
        API: {
            endpoint: httpApi.url,
            region: Stack.of(httpApi).region,
        },
    },
});