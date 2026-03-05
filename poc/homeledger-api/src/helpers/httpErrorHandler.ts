// FILENAME: src/helpers/httpErrorHandler.ts
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import logger from "@log/logger";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  next(createError(404, `Resource not found (${_req.originalUrl})`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  logger.error("Request failed", {
    status,
    message,
    stack: err.stack,
    path: req.path
  });

  res.status(status).json({
    error: {
      message,
      status
    }
  });
}