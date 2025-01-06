import { Response } from "express";


export const API_Response = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string | null = null,
    token?: string | object
): Response => {
    return res.status(statusCode).json({
        success,
        message,
        token
    })
}