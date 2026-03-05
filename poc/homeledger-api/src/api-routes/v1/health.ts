// FILENAME: src/api-routes/health.ts
import { Request, Response } from "express";
import { Operation } from "express-openapi";
import { userContextMiddleware } from "@middlewares/userContext";

export const GET: Operation = [
  userContextMiddleware,
  function (req: Request, res: Response) {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      requestId: req.context?.requestId
    });
  }
];

GET.apiDoc = {
  summary: "Health",
  description: "Simple healthcheck endpoint",
  responses: {
    200: {
      description: "Service is healthy"
    }
  }
};
