// FILENAME: src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

export interface KeycloakConfig {
  url: string;
  internalUrl: string;
  realm: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  dbUrl: string;
  sessionSecret: string;
  redisUrl: string;
  keycloak: KeycloakConfig;
}

const keycloak: KeycloakConfig = {
  url: process.env.KEYCLOAK_URL || "http://localhost:8080",
  internalUrl: process.env.INTERNAL_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.KEYCLOAK_REALM || "homeledger",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "homeledger-api",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "change-me",
  issuer:
    process.env.KEYCLOAK_ISSUER ||
    "http://localhost:8080/realms/homeledger"
};

const env: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  dbUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/homeledger",
  sessionSecret: process.env.SESSION_SECRET || "change-me",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  keycloak
};

export default env;