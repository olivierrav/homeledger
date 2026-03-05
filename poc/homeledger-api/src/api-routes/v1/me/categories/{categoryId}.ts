// FILENAME: src/api-routes/v1/me/categories/{categoryId}.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { CategoryService } from "@services/CategoryService";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new CategoryService(req.context!);
    const category = await service.get(req.params.categoryId);
    res.json(category);
});

GET.apiDoc = {
    summary: "Get a category",
    parameters: [
        {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        200: { description: "Category details" },
        404: { description: "Not found" }
    }
};

export const PUT: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new CategoryService(req.context!);
    const updated = await service.update(req.params.categoryId, req.body || {});
    res.json(updated);
});

PUT.apiDoc = {
    summary: "Update a category",
    parameters: [
        {
            in: "path",
            name: "categoryId",
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
                        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                        iconKey: { type: "string", nullable: true }
                    }
                }
            }
        }
    },
    responses: {
        200: { description: "Updated category" },
        404: { description: "Not found" }
    }
};

export const DELETE: Operation = catchAsync(async (req: Request, res: Response) => {
    const service = new CategoryService(req.context!);
    await service.delete(req.params.categoryId);
    res.status(204).send();
});

DELETE.apiDoc = {
    summary: "Delete a category",
    parameters: [
        {
            in: "path",
            name: "categoryId",
            required: true,
            schema: { type: "string", format: "uuid" }
        }
    ],
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" }
    }
};
