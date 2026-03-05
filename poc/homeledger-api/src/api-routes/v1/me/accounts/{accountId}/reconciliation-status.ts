// FILENAME: src/api-routes/v1/me/accounts/{accountId}/reconciliation-status.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { ReconciliationService } from "@services/ReconciliationService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new ReconciliationService(req.context!);
    const status = await service.getStatusForAccount(req.params.accountId);
    res.json(status);
});

GET.apiDoc = {
    summary: "Get reconciliation status for an account",
    description:
        "Returns the last reconciliation date, balance, and calculated theoretical balance. " +
        "Theoretical balance = last reconciliation balance + unpointed operations - budget balances.",
    tags: ["reconciliation"],
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" },
        },
    ],
    responses: {
        200: {
            description: "Reconciliation status",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            lastReconciliationDate: {
                                type: "string",
                                format: "date",
                                description: "Date of the last reconciliation",
                            },
                            lastReconciliationBalance: {
                                type: "number",
                                description: "Balance at the last reconciliation",
                            },
                            theoreticalBalance: {
                                type: "number",
                                description:
                                    "Calculated theoretical balance (reconciliation balance + unpointed ops - budget balances)",
                            },
                            budgetBalance: {
                                type: "number",
                                description:
                                    "Sum of current amounts of all budgets for the account",
                            },
                        },
                    },
                },
            },
        },
        401: { description: "User not authenticated" },
        403: { description: "Account not accessible" },
        404: { description: "Account or reconciliation not found" },
    },
};
