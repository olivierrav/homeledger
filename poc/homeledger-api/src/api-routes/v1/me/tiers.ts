// FILENAME: src/api-routes/v1/me/tiers.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { TierService } from "@services/TierService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new TierService(req.context!);
    const tiers = await service.list();
    res.json(tiers);
});

GET.apiDoc = {
    summary: "List tiers",
    responses: {
        200: { description: "List of tiers" }
    }
};

export const POST: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new TierService(req.context!);
    const { name, description, categoryId } = req.body || {};

    if (!name) {
        res.status(400).json({ message: "name is required" });
        return;
    }

    const tier = await service.create({ name, description, categoryId });
    res.status(201).json(tier);
});

POST.apiDoc = {
    summary: "Create a tier",
    requestBody: {
        required: true,
        description: "Tier to create",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        categoryId: { type: "string", format: "uuid", nullable: true }
                    },
                    required: ["name"]
                }
            }
        }
    },
    responses: {
        201: { description: "Tier created" }
    }
};