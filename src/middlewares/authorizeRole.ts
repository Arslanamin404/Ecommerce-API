
import { Request, NextFunction, Response } from "express";
import { API_Response } from "../utils/ApiResponse";

export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            API_Response(res, 403, false, "Unauthorized user");
            return
        }
        next(); // Proceed if authorized
    };
};
