// FILENAME: jest.config.cjs
/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    moduleFileExtensions: ["ts", "js", "json"],
    moduleNameMapper: {
        "^@config$": "<rootDir>/src/config",
        "^@config/(.*)$": "<rootDir>/src/config/$1",

        "^@log$": "<rootDir>/src/log",
        "^@log/(.*)$": "<rootDir>/src/log/$1",

        "^@db$": "<rootDir>/src/db",
        "^@db/(.*)$": "<rootDir>/src/db/$1",

        "^@services$": "<rootDir>/src/services",
        "^@services/(.*)$": "<rootDir>/src/services/$1",

        "^@api$": "<rootDir>/src/api-routes",
        "^@api/(.*)$": "<rootDir>/src/api-routes/$1",

        "^@helpers$": "<rootDir>/src/helpers",
        "^@helpers/(.*)$": "<rootDir>/src/helpers/$1",

        "^@middlewares$": "<rootDir>/src/middlewares",
        "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",

        "^@security$": "<rootDir>/src/security",
        "^@security/(.*)$": "<rootDir>/src/security/$1",

        "^@jobs$": "<rootDir>/src/jobs",
        "^@jobs/(.*)$": "<rootDir>/src/jobs/$1",

        "^@connectors$": "<rootDir>/src/connectors",
        "^@connectors/(.*)$": "<rootDir>/src/connectors/$1",

        "^@server$": "<rootDir>/src/server",
        "^@server/(.*)$": "<rootDir>/src/server/$1"
    },
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.test.json"
        }
    }
};