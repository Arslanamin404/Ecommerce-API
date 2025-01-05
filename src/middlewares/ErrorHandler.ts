import { Request, Response, NextFunction } from 'express';
import { config } from "../config/env.ts"

// Define the error type explicitly as a general Error
interface CustomError extends Error {
    statusCode?: number;
    message: string;
}

export const ErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: config.NODE_ENV === 'development' ? err.stack : {}
    });
};