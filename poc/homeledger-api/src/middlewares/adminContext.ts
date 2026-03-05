// FILENAME: src/middlewares/adminContext.ts
import { Request, Response, NextFunction } from "express";

export function adminContextMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    // Ici, tu sais que l'utilisateur a le rôle "admin"
    // Tu pourras ajouter des infos d’admin, ex:
    //
    // req.context = {
    //   ...req.context,
    //   canManageFamilies: true,
    //   auditScope: ...
    // };

    next();
}