import { Request, Response, NextFunction } from 'express';
import { API_Response } from '../utils/ApiResponse';

// Define the error type explicitly as a general Error
interface CustomError extends Error {
    statusCode?: number;
    message: string;
}

export const ErrorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';

    return API_Response(res, errStatus, false, errMsg)
};
