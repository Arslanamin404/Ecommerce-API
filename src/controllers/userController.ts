import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';


export class UserController {
    static async handle_get_profile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }
            return API_Response(res, 200, true, "Profile fetched successfully.", undefined, {
                user
            });
        } catch (error) {
            next(error);
        }
    }
};