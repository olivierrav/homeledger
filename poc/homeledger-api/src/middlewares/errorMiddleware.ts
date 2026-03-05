import logger from "@log/logger"
import ApiError from "http-errors"
import * as R from "ramda"
import { Request, Response, NextFunction } from 'express';


const DEFAULT_ERROR_MESSAGE = "Internal error occurred";

const handleExt = (err: any) => {
    if (err.status && err.errors) {
        return R.pick(["status", "errors"], err);
    } else {
        return { status: err.status ?? 500, errors: [{ message: DEFAULT_ERROR_MESSAGE }] };
    }
};

const handleDefault = (err: any) => {
    const isHttpError = ApiError.isHttpError(err);
    return {
        status: err.status ?? 500,
        message: isHttpError ? err.message : DEFAULT_ERROR_MESSAGE,
        details: isHttpError ? err.details : undefined,
        errors: err.errors,
    };
};

interface ErrorResponse {
    status: number;
    errors?: Array<{ message: string }>;
    message?: string;
    details?: any;
}


export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction): void {
    const toReturn: ErrorResponse = handleDefault(err);

    const l = toReturn.status >= 500 ? logger.error : logger.warn;
    l(`${req.method} ${toReturn.status} ${req.originalUrl}: `, err);

    res.status(toReturn.status).json(toReturn);
};
