import { NextFunction, Request, Response } from "express";
import { API_Response } from "../utils/ApiResponse";
import { verifyToken } from "../utils/generatedToken";
import { config } from "../config/env";
import { User } from "../models/userModel";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return API_Response(res, 401, false, "Unauthorized: Access token is missing.");
        }

        const decode = verifyToken(token, config.ACCESS_TOKEN_SECRET, next);

        if (!decode) {
            return API_Response(res, 401, false, "Unauthorized: Invalid or expired Access Token");
        }

        const user = await User.findById(decode?._id).select("-password");
        if (!user) {
            return API_Response(res, 401, false, "Unauthorized: User not found");
        }
        req.user = user;
        next()
    } catch (error) {
        next(error)
    }
}