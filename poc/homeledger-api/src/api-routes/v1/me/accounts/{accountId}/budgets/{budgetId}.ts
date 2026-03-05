// FILENAME: src/api-routes/v1/me/accounts/{accountId}/budgets/{budgetId}.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { BudgetService } from "@services/BudgetService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    const budget = await service.getForAccount(req.params.accountId, req.params.budgetId);
    res.json(budget);
});

GET.apiDoc = {
    summary: "Get a budget",
    parameters: [
        { in: "path", name: "accountId", required: true, schema: { type: "string", format: "uuid" } },
        { in: "path", name: "budgetId", required: true, schema: { type: "string", format: "uuid" } }
    ],
    responses: {
        200: { description: "Budget details" },
        404: { description: "Not found" }
    }
};

export const PUT: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    const updated = await service.updateForAccount(
        req.params.accountId,
        req.params.budgetId,
        req.body || {}
    );
    res.json(updated);
});

PUT.apiDoc = {
    summary: "Update a budget",
    parameters: [
        { in: "path", name: "accountId", required: true, schema: { type: "string", format: "uuid" } },
        { in: "path", name: "budgetId", required: true, schema: { type: "string", format: "uuid" } }
    ],
    responses: {
        200: { description: "Budget updated" },
        400: { description: "Invalid payload" },
        404: { description: "Not found" }
    }
};

export const DELETE: Operation = async (req: Request, res: Response) => {
    const service = new BudgetService(req.context!);
    await service.deleteForAccount(req.params.accountId, req.params.budgetId);
    res.status(204).send();
};

DELETE.apiDoc = {
    summary: "Delete a budget",
    parameters: [
        { in: "path", name: "accountId", required: true, schema: { type: "string", format: "uuid" } },
        { in: "path", name: "budgetId", required: true, schema: { type: "string", format: "uuid" } }
    ],
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" }
    }
};