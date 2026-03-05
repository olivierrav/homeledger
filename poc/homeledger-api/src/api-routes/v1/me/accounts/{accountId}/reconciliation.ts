// FILENAME: src/api-routes/v1/me/accounts/{accountId}/operations.ts
import { Request, Response } from "express";
import { Operation as OpenApiOperation } from "express-openapi";
import { catchAsync } from "@helpers/catchAsync";
import { ReconciliationService } from "@services/ReconciliationService";


export const POST: OpenApiOperation = catchAsync(async (req: Request, res: Response) => {
    const service = new ReconciliationService(req.context!);
    const {
        date, amount, operationIds
    } = req.body || {};

    const { accountId } = req.params



    const rec = await service.createForAccount(accountId, date, amount, operationIds);

    res.status(201).json(rec);
});

POST.apiDoc = {
    summary: "Create a new reconciliation for an account",
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
                        date: { type: "string", format: "date" },
                        amount: { type: "number" },
                        operationIds: {
                            type: "array",
                            items: { type: "string", format: "uuid" }
                        }
                    },
                    required: ["date", "amount", "operationIds"]
                }
            }
        }
    },
    responses: {
        201: { description: "Reconciliation created" }
    }
};