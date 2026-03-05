import { Request, Response } from "express";
import { Operation as OpenApiOperation } from "express-openapi";
import { OperationService } from "@services/OperationService";
import { catchAsync } from "@helpers/catchAsync";

export const PUT: OpenApiOperation = catchAsync(async (req: Request, res: Response) => {
    const service = new OperationService(req.context!);
    const op = await service.updateForAccount(
        req.params.accountId,
        req.params.operationId,
        req.body || {}
    );
    res.json(op);
});

PUT.apiDoc = {
    summary: "Update an operation on an account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        },
        {
            in: "path",
            name: "operationId",
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
                        status: { type: "string", enum: ["pending", "posted"] },
                        rawLabel: { type: "string", nullable: true },
                        normalizedLabel: { type: "string", nullable: true },
                        suggestedTierId: { type: "string", format: "uuid", nullable: true },
                        suggestedBudgetId: { type: "string", format: "uuid", nullable: true },
                        suggestionConfidence: { type: "number", minimum: 0, maximum: 1, nullable: true },
                        suggestionAccepted: { type: "boolean", nullable: true }
                    }
                }
            }
        }
    },
    responses: {
        200: { description: "Operation updated" },
        400: { description: "Impossible de modifier une opération pointée" },
        404: { description: "Operation not found" }
    }
};

export const DELETE: OpenApiOperation = async (req: Request, res: Response) => {
    const service = new OperationService(req.context!);
    await service.deleteForAccount(req.params.accountId, req.params.operationId);
    res.status(204).send();
};

DELETE.apiDoc = {
    summary: "Delete an operation on an account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        },
        {
            in: "path",
            name: "operationId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        204: { description: "Operation deleted" },
        400: { description: "Impossible de supprimer une opération pointée" },
        404: { description: "Operation not found" }
    }
};
