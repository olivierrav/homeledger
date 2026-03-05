// FILENAME: src/api-routes/v1/me/accounts/{accountId}.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { AccountService } from "@services/AccountService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new AccountService(req.context!);
    const account = await service.getForCurrentUser(req.params.accountId);
    res.json(account);
});

GET.apiDoc = {
    summary: "Get a single account",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        200: { description: "Account details" },
        404: { description: "Not found" }
    }
};

export const PUT: Operation = async (req: Request, res: Response) => {
    const service = new AccountService(req.context!);
    const updated = await service.updateForCurrentUser(
        req.params.accountId,
        req.body || {}
    );
    res.json(updated);
};

PUT.apiDoc = {
    summary: "Update an account (except initialBalance)",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        200: { description: "Updated account" },
        400: { description: "Invalid payload" },
        404: { description: "Not found" }
    }
};

export const DELETE: Operation = async (req: Request, res: Response) => {
    const service = new AccountService(req.context!);
    await service.deleteForCurrentUser(req.params.accountId);
    res.status(204).send();
};

DELETE.apiDoc = {
    summary: "Delete an account for the current user",
    parameters: [
        {
            in: "path",
            name: "accountId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" }
    }
};