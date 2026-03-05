import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrapper pour propager les erreurs des handlers async à Express.
 */
export function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => any): RequestHandler {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
