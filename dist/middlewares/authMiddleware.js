"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const generatedToken_1 = require("../utils/generatedToken");
const env_1 = require("../config/env");
const userModel_1 = require("../models/userModel");
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        if (!token) {
            (0, ApiResponse_1.API_Response)(res, 401, false, "Unauthorized: Access token is missing.");
            return;
        }
        const decode = (0, generatedToken_1.verifyToken)(token, env_1.config.ACCESS_TOKEN_SECRET, next);
        if (!decode) {
            (0, ApiResponse_1.API_Response)(res, 401, false, "Unauthorized: Invalid or expired Access Token");
            return;
        }
        const user = await userModel_1.User.findById(decode?._id).select("-password");
        if (!user) {
            (0, ApiResponse_1.API_Response)(res, 401, false, "Unauthorized: User not found");
            return;
        }
        // req.user = user as IUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
