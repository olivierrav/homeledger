// FILENAME: src/api-routes/v1/me/categories.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { CategoryService } from "@services/CategoryService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new CategoryService(req.context!);
    const categories = await service.list();
    res.json(categories);
});

GET.apiDoc = {
    summary: "List categories",
    responses: {
        200: { description: "List of categories" }
    }
};

export const POST: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new CategoryService(req.context!);
    const { name, color, iconKey } = req.body || {};

    if (!name) {
        res.status(400).json({ message: "name is required" });
        return;
    }

    const category = await service.create({ name, color, iconKey });
    res.status(201).json(category);
});

POST.apiDoc = {
    summary: "Create a category",
    requestBody: {
        required: true,
        description: "Category to create",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                        iconKey: { type: "string", nullable: true }
                    },
                    required: ["name"]
                }
            }
        }
    },
    responses: {
        201: { description: "Category created" }
    }
};
