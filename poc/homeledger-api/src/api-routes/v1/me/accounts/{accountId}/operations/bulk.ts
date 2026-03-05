// FILENAME: src/api-routes/v1/me/accounts/{accountId}/operations/bulk.ts
import { Request, Response } from "express";
import { Operation as OpenApiOperation } from "express-openapi";
import { OperationService } from "@services/OperationService";
import { catchAsync } from "@helpers/catchAsync";

export const POST: OpenApiOperation = catchAsync(async (req: Request, res: Response) => {
    const service = new OperationService(req.context!);
    const { accountId } = req.params;
    const operations = req.body;

    if (!Array.isArray(operations) || operations.length === 0) {
        res.status(400).json({
            message: "Request body must be a non-empty array of operations"
        });
        return;
    }

    for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        if (!op.dateTime || op.amount === undefined) {
            res.status(400).json({
                message: `Operation at index ${i} is missing required fields: dateTime and amount are required`
            });
            return;
        }
    }

    const createdOps = await service.createBulkForAccount(accountId, operations);

    res.status(201).json(createdOps);
});

POST.apiDoc = {
    summary: "Bulk create operations on an account",
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
                            tierId: { type: "string", format: "uuid", nullable: true },
                            dateTime: { type: "string", format: "date-time" },
                            amount: { type: "number" },
                            description: { type: "string", nullable: true },
                            budgetId: { type: "string", format: "uuid", nullable: true },
                            categoryId: { type: "string", format: "uuid", nullable: true },
                            linkedAccountId: { type: "string", format: "uuid", nullable: true },
                            type: { type: "string", enum: ["card", "transfer", "deposit", "cheque", "direct_debit", "other"], nullable: true },
                            imported: { type: "boolean" },
                            status: { type: "string", enum: ["pending", "posted"] },
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
        }
    },
    responses: {
        201: { description: "Operations created" },
        400: { description: "Invalid request body" }
    }
};
