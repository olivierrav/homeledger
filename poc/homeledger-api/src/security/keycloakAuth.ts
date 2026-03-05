// FILENAME: src/security/keycloakAuth.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { keycloak } from "./keycloak";
import { env } from "@config";
import { RequestContext, RequestUser } from "@middlewares/context";

declare module "express-serve-static-core" {
    interface Request {
        kauth?: any;
        context?: RequestContext;
    }
}

function extractUserFromToken(token: any): RequestUser {
    const content = token?.content || {};

    const realmRoles =
        content.realm_access && Array.isArray(content.realm_access.roles)
            ? content.realm_access.roles
            : [];

    const clientRoles =
        content.resource_access &&
            content.resource_access[env.keycloak.clientId] &&
            Array.isArray(
                content.resource_access[env.keycloak.clientId].roles
            )
            ? content.resource_access[env.keycloak.clientId].roles
            : [];

    const roles = Array.from(
        new Set<string>([...realmRoles, ...clientRoles])
    );

    const firstName =
        (content.given_name as string | undefined) ||
        (content.name ? String(content.name).split(" ")[0] : undefined);

    const lastName =
        (content.family_name as string | undefined) || undefined;

    return {
        id: String(content.sub || ""),
        email: content.email as string | undefined,
        roles,
        firstName,
        lastName
    };
}

export function keycloakAuth(): RequestHandler[] {
    const protect = keycloak.protect();

    const attachUser: RequestHandler = (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        const token = req.kauth?.grant?.access_token;
        if (token) {
            const user = extractUserFromToken(token);
            req.context = {
                ...(req.context || { requestId: "" }),
                requestId: req.context?.requestId || "",
                user
            };
        }
        next();
    };

    return [protect, attachUser];
}