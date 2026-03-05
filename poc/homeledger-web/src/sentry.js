// FILENAME: src/sentry.js
import * as Sentry from "@sentry/react";

export function initSentry() {
    if (import.meta.env.IS_PRODUCTION !== "true") {
        // En dev: pas d’init Sentry (ou init très minimal si tu veux tester)
        return;
    }

    Sentry.init({
        dsn: "<TON_DSN_SENTRY_ICI>",
        tracesSampleRate: 1.0
        // tu peux ajouter d’autres options si besoin
    });
}

export { Sentry };