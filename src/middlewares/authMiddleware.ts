import { NextFunction, Request, Response } from "express";
import { API_Response } from "../utils/ApiResponse";
import { verifyToken } from "../utils/generatedToken";
import { config } from "../config/env";
import { User } from "../models/userModel";
import { IUser } from "../interfaces/IUser";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            API_Response(res, 401, false, "Unauthorized: Access token is missing.");
            return
        }

        const decode = verifyToken(token, config.ACCESS_TOKEN_SECRET, next);

        if (!decode) {
            API_Response(res, 401, false, "Unauthorized: Invalid or expired Access Token");
            return
        }

        const user = await User.findById(decode?._id).select("-password");
        if (!user) {
            API_Response(res, 401, false, "Unauthorized: User not found");
            return
        }
        // req.user = user as IUser;
        next()
    } catch (error) {
        next(error)
    }
}