// FILENAME: src/api-routes/v1/me/tiers/{tierId}.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { TierService } from "@services/TierService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new TierService(req.context!);
    const tier = await service.get(req.params.tierId);
    res.json(tier);
});

GET.apiDoc = {
    summary: "Get a tier",
    parameters: [
        {
            in: "path",
            name: "tierId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        200: { description: "Tier details" },
        404: { description: "Not found" }
    }
};

export const PUT: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new TierService(req.context!);
    const updated = await service.update(req.params.tierId, req.body || {});
    res.json(updated);
});

PUT.apiDoc = {
    summary: "Update a tier",
    parameters: [
        {
            in: "path",
            name: "tierId",
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
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        categoryId: { type: "string", format: "uuid", nullable: true }
                    }
                }
            }
        }
    },
    responses: {
        200: { description: "Updated tier" },
        404: { description: "Not found" }
    }
};

export const DELETE: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new TierService(req.context!);
    await service.delete(req.params.tierId);
    res.status(204).send();
});

DELETE.apiDoc = {
    summary: "Delete a tier",
    parameters: [
        {
            in: "path",
            name: "tierId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" }
    }
};