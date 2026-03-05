// FILENAME: src/api-routes/v1/me/accounts.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import createError from "http-errors";

import { userContextMiddleware } from "@middlewares/userContext";
import { AccountService } from "@services/AccountService";
import { catchAsync } from "@helpers/catchAsync";

// GET /v1/me/accounts – liste des comptes de l’utilisateur courant
export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    if (!req.context?.appUser) {
        throw createError(401, "Unauthorized");
    }

    const service = new AccountService(req.context);
    const accounts = await service.listForCurrentUser();

    res.status(200).json(accounts);
})
    ;

GET.apiDoc = {
    summary: "List user accounts",
    description: "Retourne la liste des comptes bancaires de l’utilisateur courant",
    responses: {
        200: {
            description: "Liste des comptes"
        },
        401: {
            description: "Utilisateur non authentifié"
        }
    }
};

// POST /v1/me/accounts – création d’un compte
export const POST: Operation = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.context?.appUser) {
            throw createError(401, "Unauthorized");
        }

        const {
            name,
            bankName,
            accountNumber,
            type,
            initialBalance,
            interestRate
        } = req.body;

        if (!name || !type) {
            throw createError(400, "Missing required fields");
        }

        const service = new AccountService(req.context);
        const account = await service.createForCurrentUser({
            name,
            bankName,
            accountNumber,
            type,
            initialBalance,
            interestRate
        });

        // 201 + Location
        res
            .status(201)
            .location(`/v1/accounts/${account.id}`)
            .json(account);
    })

POST.apiDoc = {
    summary: "Create account",
    responses: {
        201: { description: "Compte créé" },
        400: { description: "Requête invalide" },
        401: { description: "Utilisateur non authentifié" }
    }
};

// GET /v1/meaccounts/:id – détail d’un compte
export const GET_ONE: Operation = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.context?.appUser) {
            throw createError(401, "Unauthorized");
        }

        const service = new AccountService(req.context);
        const account = await service.getForCurrentUser(req.params.id);

        if (!account) {
            throw createError(404, "Account not found");
        }

        res.status(200).json(account);
    }
);

GET_ONE.apiDoc = {
    summary: "Get account details",
    responses: {
        200: { description: "Compte trouvé" },
        401: { description: "Utilisateur non authentifié" },
        404: { description: "Compte introuvable" }
    }
};

// PUT /v1/accounts/:id – mise à jour d’un compte (hors solde initial)
export const PUT: Operation = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.context?.appUser) {
            throw createError(401, "Unauthorized");
        }

        const service = new AccountService(req.context);
        const updated = await service.updateForCurrentUser(req.params.id, req.body);

        res.status(200).json(updated);
    }
);

PUT.apiDoc = {
    summary: "Update account",
    responses: {
        200: { description: "Compte mis à jour" },
        400: { description: "Requête invalide" },
        401: { description: "Utilisateur non authentifié" },
        404: { description: "Compte introuvable" }
    }
};

// DELETE /v1/accounts/:id – suppression
export const DELETE: Operation = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.context?.appUser) {
            throw createError(401, "Unauthorized");
        }

        const service = new AccountService(req.context);
        await service.deleteForCurrentUser(req.params.id);

        // 204, pas de body
        res.status(204).send();
    }
);

DELETE.apiDoc = {
    summary: "Delete account",
    responses: {
        204: { description: "Compte supprimé" },
        401: { description: "Utilisateur non authentifié" },
        404: { description: "Compte introuvable" }
    }
};