// FILENAME: src/api-routes/api/v1/me.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { userContextMiddleware } from "@middlewares/userContext";
import { catchAsync } from "@helpers/catchAsync";

export const GET: Operation = catchAsync(
    function (req: Request, res: Response) {
        if (!req.context?.user) {
            return res.status(500).json({ error: "No user in context" });
        }

        res.json({
            id: req.context.user.id,
            email: req.context.user.email,
            roles: req.context.user.roles,
            requestId: req.context.requestId
        });
    }
);

GET.apiDoc = {
    summary: "Current admin",
    description: "Returns information about the authenticated admin",
    responses: {
        200: { description: "Admin info" },
        401: { description: "Unauthorized" }
    }
};