// FILENAME: src/middlewares/ensureUser.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "@services/UserService";

export async function ensureUserMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.context) {
            return res
                .status(500)
                .json({ error: "Request context not initialized" });
        }

        if (!req.context.user) {
            return res
                .status(500)
                .json({ error: "Keycloak user not found in context" });
        }

        const userService = new UserService(req.context);
        const appUser = await userService.ensureUser();

        req.context = {
            ...req.context,
            appUser
        };

        next();
    } catch (err) {
        next(err);
    }
}