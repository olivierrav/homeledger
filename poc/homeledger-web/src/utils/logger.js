// FILENAME: src/utils/logger.js
import { Sentry } from "../sentry";

const isDev = import.meta.env.IS_PRODUCTION !== "true";

function error(err, context) {
    if (isDev) {
        // Dev: on log dans la console pour debug
        // on évite le spam, donc uniquement error
        // eslint-disable-next-line no-console
        console.error("[ERROR]", err, context || "");
    } else {
        // Prod: on envoie à Sentry
        if (err instanceof Error) {
            Sentry.captureException(err, {
                extra: context
            });
        } else {
            Sentry.captureMessage(
                typeof err === "string" ? err : JSON.stringify(err),
                {
                    level: "error",
                    extra: context
                }
            );
        }
    }
}

function warn(message, context) {
    if (isDev) {
        // eslint-disable-next-line no-console
        console.warn("[WARN]", message, context || "");
    } else {
        Sentry.captureMessage(message, {
            level: "warning",
            extra: context
        });
    }
}

function info(message, context) {
    if (isDev) {
        // eslint-disable-next-line no-console
        console.log("[INFO]", message, context || "");
    } else {
        // En prod tu peux décider de ne rien faire,
        // ou d’envoyer certains messages importants.
        // Ici on ne log pas les infos pour éviter le bruit.
    }
}

const logger = {
    error,
    warn,
    info
};

export default logger;