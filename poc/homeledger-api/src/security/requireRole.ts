// FILENAME: src/security/requireRole.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export function requireRoleMiddleware(role: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const roles = req.context?.user?.roles || [];

        if (!roles.includes(role)) {
            return res.status(403).json({
                error: "Forbidden",
                message: `Missing required role: ${role}`
            });
        }

        next();
    };
}