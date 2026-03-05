// FILENAME: src/server/app.ts
import path from "path";
import express from "express";
import session from "express-session";
import cors from "cors";
import { initialize } from "express-openapi";

import { env } from "@config";
import logger from "@log/logger";
import { initDatabase } from "@db";
import { notFoundHandler, errorHandler } from "@helpers/httpErrorHandler";
import { keycloak, memoryStore } from "@security/keycloak";
import { errorMiddleware } from "@middlewares/errorMiddleware";
import { keycloakAuth } from "@security/keycloakAuth";
import { ensureUserMiddleware } from "@middlewares/ensureUser";
import { userContextMiddleware } from "@middlewares/userContext";

export async function createApp() {
    await initDatabase();

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(
        session({
            secret: env.sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: memoryStore
        })
    );

    // keycloak-connect global
    app.use(keycloak.middleware());

    // toutes les routes /v1/me sont protégées + user en base + contexte user
    app.use(
        "/v1/me",
        ...keycloakAuth(),
        ensureUserMiddleware,
        userContextMiddleware
    );

    const apiDoc = {
        openapi: "3.0.1",
        info: {
            title: "HomeLedger API",
            version: "1.0.0"
        },
        paths: {}
    };

    const openapi = initialize({
        app,
        apiDoc,
        paths: path.resolve(__dirname, "../api-routes"),
        routesGlob: "**/*.{ts,js}",
        routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
        errorMiddleware
    });

    // logger des routes chargées, une ligne par route :
    Object.keys(openapi.apiDoc.paths).forEach((route) => {
        logger.info(
            `${route}`
        );
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}