// FILENAME: src/api-routes/v1/me/accounts/{accountId}/operations.ts
import { Request, Response } from "express";
import { Operation as OpenApiOperation } from "express-openapi";
import { OperationService } from "@services/OperationService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: OpenApiOperation = catchAsync(async (req: Request, res: Response) => {
    const service = new OperationService(req.context!);
    const pointedParam = req.query.pointed as string | undefined;
    let pointed: boolean | undefined;

    if (pointedParam === "true") pointed = true;
    if (pointedParam === "false") pointed = false;

    const ops = await service.listForAccount(req.params.accountId, { pointed });
    res.json(ops);
});

GET.apiDoc = {
    summary: "List operations for an account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        },
        {
            in: "query",
            name: "pointed",
            schema: { type: "string", enum: ["true", "false"] },
            required: false
        }
    ],
    responses: {
        200: { description: "List of operations" }
    }
};

export const POST: OpenApiOperation = catchAsync(async (req: Request, res: Response) => {
    const service = new OperationService(req.context!);
    const {
        tierId,
        dateTime,
        amount,
        description,
        budgetId,
        categoryId,
        type,
        linkedAccountId,
        imported,
        rawLabel,
        normalizedLabel,
        suggestedTierId,
        suggestedBudgetId,
        suggestionConfidence,
        suggestionAccepted
    } = req.body || {};

    const { accountId } = req.params

    if (!dateTime || amount === undefined) {
        res.status(400).json({
            message: "dateTime and amount are required"
        });
        return;
    }

    const op = await service.createForAccount(accountId, {
        tierId,
        dateTime,
        amount,
        description,
        budgetId,
        categoryId,
        linkedAccountId,
        type,
        imported,
        rawLabel,
        normalizedLabel,
        suggestedTierId,
        suggestedBudgetId,
        suggestionConfidence,
        suggestionAccepted
    });

    res.status(201).json(op);
});

POST.apiDoc = {
    summary: "Create an operation on an account",
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
                    properties: {
                        tierId: { type: "string", format: "uuid", nullable: true },
                        dateTime: { type: "string", format: "date-time" },
                        amount: { type: "number" },
                        description: { type: "string", nullable: true },
                        budgetId: { type: "string", format: "uuid", nullable: true },
                        categoryId: { type: "string", format: "uuid", nullable: true },
                        linkedAccountId: { type: "string", format: "uuid", nullable: true },
                        type: { type: "string", enum: ["card", "transfer", "deposit", "cheque", "direct_debit", "other"], nullable: true },
                        imported: { type: "boolean" },
                        rawLabel: { type: "string", nullable: true },
                        normalizedLabel: { type: "string", nullable: true },
                        suggestedTierId: { type: "string", format: "uuid", nullable: true },
                        suggestedBudgetId: { type: "string", format: "uuid", nullable: true },
                        suggestionConfidence: { type: "number", minimum: 0, maximum: 1, nullable: true },
                        suggestionAccepted: { type: "boolean", nullable: true }
                    },
                    required: ["dateTime", "amount"]
                }
            }
        }
    },
    responses: {
        201: { description: "Operation created" }
    }
};