// FILENAME: src/api-routes/v1/me/budgets.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import createError from "http-errors";
import { BudgetService } from "@services/BudgetService";
import { catchAsync } from "@helpers/catchAsync";

// GET /v1/me/budgets
export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    if (!req.context?.appUser) {
        throw createError(401, "Unauthorized");
    }

    const service = new BudgetService(req.context);
    const budgets = await service.listForCurrentUser();

    return res.status(200).json(budgets);
});

GET.apiDoc = {
    summary: "List budgets for current user",
    description:
        "Retourne la liste des budgets rattachés aux comptes de l'utilisateur courant.",
    tags: ["budgets"],
    responses: {
        200: {
            description: "Liste des budgets",
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                label: { type: "string" },
                                color: { type: "string" },
                                iconKey: { type: "string" },
                                monthlyAmount: { type: "number" },
                                comment: { type: "string" },
                            },
                        },
                    },
                },
            },

        },
        401: {
            description: "Utilisateur non authentifié",
        },
    },
};

// POST /v1/me/budgets
export const POST: Operation = catchAsync(async (req: Request, res: Response) => {
    if (!req.context?.appUser) {
        throw createError(401, "Unauthorized");
    }

    const {
        accountId,
        label,
        color,
        iconKey,
        monthlyAmount,
        comment,
    } = req.body;

    if (!accountId || !label) {
        throw createError(400, "Missing required fields: accountId, label");
    }

    const service = new BudgetService(req.context);
    const budget = await service.createForCurrentUser(accountId, {
        label,
        color,
        iconKey,
        monthlyAmount,
        comment,
    });

    return res
        .status(201)
        .location(`/v1/me/budgets/${budget.id}`)
        .json(budget);
});

POST.apiDoc = {
    summary: "Create budget for current user",
    description:
        "Crée un budget rattaché à un compte de l'utilisateur courant, avec un montant mensuel prévu.",
    tags: ["budgets"],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        accountId: { type: "string", format: "uuid" },
                        label: { type: "string" },
                        color: { type: "string" },
                        iconKey: { type: "string" },
                        monthlyAmount: { type: "number" },
                        comment: { type: "string" },
                    },
                    required: ["accountId", "label"],
                },
            },
        },
    },
    responses: {
        201: {
            description: "Budget créé",
        },
        400: {
            description: "Requête invalide",
        },
        401: {
            description: "Utilisateur non authentifié",
        },
    },
};

// PUT /v1/me/budgets
export const PUT: Operation = catchAsync(async (req: Request, res: Response) => {
    if (!req.context?.appUser) {
        throw createError(401, "Unauthorized");
    }

    const service = new BudgetService(req.context);
    const budgets = await service.updateBudgetList(req.body);

    return res.status(200).json(budgets);
});

PUT.apiDoc = {
    summary: "Update budgets for current user",
    description:
        "Met à jour la liste des budgets de l'utilisateur courant. Les budgets doivent être passés dans le corps de la requête.",
    tags: ["budgets"],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string", format: "uuid" },
                            label: { type: "string" },
                            color: { type: "string" },
                            iconKey: { type: "string" },
                            monthlyAmount: { type: "number" },
                            comment: { type: "string" },
                        },
                        required: ["monthlyAmount", "label"],
                    },
                },
            },
        },
    },
    responses: {
        200: {
            description: "Budgets mis à jour",
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                label: { type: "string" },
                                color: { type: "string" },
                                iconKey: { type: "string" },
                                monthlyAmount: { type: "number" },
                                comment: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
        400: {
            description: "Requête invalide",
        },
        401: {
            description: "Utilisateur non authentifié",
        },
    },
};