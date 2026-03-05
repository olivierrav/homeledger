// FILENAME: src/security/keycloak.ts
import session from "express-session";
import Keycloak from "keycloak-connect";
import { env } from "@config";
import logger from "@log/logger";

const memoryStore = new session.MemoryStore();

const keycloakConfig = {
    realm: env.keycloak.realm,                       // "homeledger"
    "auth-server-url": "https://auth.mac-perso-ora.test", // URL externe, en https
    "ssl-required": "external",
    resource: "homeledger-api",                     // client back bearer-only
    "bearer-only": true,
    "verify-token-audience": true,
    credentials: {},                                // pas de secret pour bearer-only
    "confidential-port": 0
};

logger.info("Keycloak adapter config", keycloakConfig);

const keycloak = new Keycloak(
    { store: memoryStore },
    keycloakConfig
);

export { keycloak, memoryStore };