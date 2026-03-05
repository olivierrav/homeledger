// FILENAME: src/security/auth.ts
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const isAuthenticated = Boolean((req.session as any)?.userId);

  if (!isAuthenticated) {
    return next(createError(401, "Authentication required"));
  }

  next();
}