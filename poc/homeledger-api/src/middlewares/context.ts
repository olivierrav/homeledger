// FILENAME: src/middlewares/context.ts
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { User } from "@db";

export interface RequestUser {
    id: string; // sub Keycloak
    email?: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
}

export interface RequestContext {
    requestId: string;
    user?: RequestUser; // issu du token Keycloak
    appUser?: User;     // utilisateur HomeLedger en BDD
    // plus tard: familyId, defaultAccountId, etc.
}

declare module "express-serve-static-core" {
    interface Request {
        context?: RequestContext;
    }
}

export function contextMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (!req.context) {
        req.context = {
            requestId: uuidv4()
        };
    } else if (!req.context.requestId) {
        req.context.requestId = uuidv4();
    }

    next();
}