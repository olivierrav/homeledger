// FILENAME: src/api-routes/v1/debug-token.ts
import { Operation } from "express-openapi";
import { userContextMiddleware } from "@middlewares/userContext";

export const GET: Operation = [
    userContextMiddleware,
    async function (req, res) {
        const auth = req.headers.authorization;

        if (!auth || !auth.startsWith("Bearer ")) {
            res.status(400).json({ error: "Missing bearer token" });
            return;
        }

        const token = auth.substring("Bearer ".length);

        try {
            // import dynamique: ne charge `jose` que si la route est appelée
            const { decodeJwt } = await import("jose");
            const payload = decodeJwt(token);

            res.json({
                token,
                payload
            });
        } catch (err) {
            // En local/debug seulement, donc on reste simple
            // eslint-disable-next-line no-console
            console.error("Failed to decode token", err);
            res.status(500).json({ error: "Failed to decode token" });
        }
    }
];

GET.apiDoc = {
    summary: "Decode current JWT",
    description:
        "Debug endpoint: returns the decoded JWT payload for the current bearer token.",
    responses: {
        200: {
            description: "Token decoded"
        },
        400: {
            description: "Missing or invalid bearer token"
        },
        500: {
            description: "Error while decoding token"
        }
    }
};