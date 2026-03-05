// FILENAME: src/api-routes/v1/me/accounts/{accountId}/budgets.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { BudgetService } from "@services/BudgetService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    const budgets = await service.listForAccount(req.params.accountId);
    res.json(budgets);
});

GET.apiDoc = {
    summary: "List budgets for an account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        200: { description: "List of budgets" }
    }
};

export const POST: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    const { label, iconKey, color, monthlyAmount, comment } = req.body || {};

    if (!label || !iconKey || !color || monthlyAmount === undefined) {
        res.status(400).json({
            message: "label, iconKey, color and monthlyAmount are required"
        });
        return;
    }

    const budget = await service.createForAccount(req.params.accountId, {
        label,
        iconKey,
        color,
        monthlyAmount,
        comment
    });

    res.status(201).json(budget);
});

POST.apiDoc = {
    summary: "Create a budget on an account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["label", "iconKey", "color", "monthlyAmount"],
                    properties: {
                        label: { type: "string" },
                        iconKey: { type: "string" },
                        color: { type: "string" },
                        monthlyAmount: { type: "number" },
                        comment: { type: "string" }
                    }
                }
            }
        }
    },
    responses: {
        201: { description: "Budget created" }
    }
};

// PUT /v1/me/accounts/{accountId}/budgets
export const PUT: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    const budgets = await service.updateBudgetListForAccount(req.params.accountId, req.body);
    res.json(budgets);
});

PUT.apiDoc = {
    summary: "Update budgets for an account",
    description:
        "Met à jour la liste des budgets d'un compte. Les budgets dont l'id n'est pas dans le tableau sont supprimés, ceux avec un id sont mis à jour, ceux sans id sont créés.",
    tags: ["budgets"],
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
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
                            comment: { type: "string" }
                        },
                        required: ["label", "monthlyAmount"]
                    }
                }
            }
        }
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
                                currentBalance: { type: "number" },
                                comment: { type: "string" }
                            }
                        }
                    }
                }
            }
        },
        400: { description: "Requête invalide" },
        401: { description: "Utilisateur non authentifié" },
        403: { description: "Accès interdit au compte" }
    }
};