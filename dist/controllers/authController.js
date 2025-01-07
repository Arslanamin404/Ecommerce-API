"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../models/userModel");
const generatedToken_1 = require("../utils/generatedToken");
const emailService_1 = require("../services/emailService");
const otpGenerator_1 = require("../utils/otpGenerator");
const env_1 = require("../config/env");
const ApiResponse_1 = require("../utils/ApiResponse");
const userService_1 = require("../services/userService");
class AuthController {
    static async handle_register_user(req, res, next) {
        try {
            const { first_name, last_name, email, password } = req.body;
            if (!first_name || !email || !password) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "All fields are required");
            }
            const existingUser = await userService_1.UserService.checkExistingUser(email);
            if (existingUser) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "User already registered");
            }
            const raw_otp = (0, otpGenerator_1.generate_OTP)();
            const otpExpiresAt = new Date(Date.now() + (env_1.config.OTP_EXPIRES || 5 * 60 * 1000)); // OTP valid for 5 minutes
            const hashed_OTP = await (0, otpGenerator_1.generate_hashed_OTP)(raw_otp, next);
            const new_user = new userModel_1.User({ first_name, last_name, email, password, otp: hashed_OTP, otpExpiresAt });
            await new_user.save();
            await (0, emailService_1.sendEmail)(email, "Verify Your Email", `Your OTP is: ${raw_otp}.\nIts valid for 5 minutes only.`);
            return (0, ApiResponse_1.API_Response)(res, 201, true, "User registered. OTP sent to email.");
        }
        catch (error) {
            next(error);
        }
    }
    ;
    static async handle_verify_otp(req, res, next) {
        const { email, otp } = req.body;
        try {
            if (!email || !otp) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "All fields are required");
            }
            const user = await userService_1.UserService.findUserByEmail(email);
            if (!user) {
                return (0, ApiResponse_1.API_Response)(res, 401, false, "Invalid Credentials");
            }
            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "Invalid or expired OTP");
            }
            // Ensure `user.otp` is defined
            if (!user.otp) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "Invalid or expired OTP");
            }
            const isOtpValid = await (0, otpGenerator_1.verify_OTP)(otp, user.otp, next);
            if (!isOtpValid) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "Invalid or expired OTP");
            }
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();
            return (0, ApiResponse_1.API_Response)(res, 200, true, "Email verified successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async handle_login_user(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "All fields are required");
            }
            const user = await userService_1.UserService.findUserByEmail(email);
            if (!user) {
                return (0, ApiResponse_1.API_Response)(res, 401, false, "Invalid Credentials");
            }
            if (!user.isVerified) {
                return (0, ApiResponse_1.API_Response)(res, 403, false, "Email not verified");
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return (0, ApiResponse_1.API_Response)(res, 401, false, "Invalid Credentials");
            }
            // Generate tokens (refresh token -- Long Lived adn accessToken -- Short lived)
            const { refreshToken, accessToken } = (0, generatedToken_1.generateTokens)({ id: user._id.toString(), email: user.email, role: user.role });
            // Save refreshToken in DB
            user.refreshToken = refreshToken;
            await user.save();
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            return (0, ApiResponse_1.API_Response)(res, 200, true, null);
        }
        catch (error) {
            next(error);
        }
    }
    static async handle_logout_user(req, res, next) {
        try {
            // Get refresh token from cookies or request body
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!incomingRefreshToken) {
                return (0, ApiResponse_1.API_Response)(res, 400, false, "Refresh token is required for logout");
            }
            // Find user with the provided refresh token
            const user = await userService_1.UserService.findUserByRefreshToken(incomingRefreshToken);
            if (!user) {
                return (0, ApiResponse_1.API_Response)(res, 403, false, "Invalid refresh token");
            }
            // Clear the refresh token from the user's record
            user.refreshToken = undefined;
            await user.save();
            // Clear the token cookies
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            return (0, ApiResponse_1.API_Response)(res, 200, true, "Logged out successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async handle_refresh_accessToken(req, res, next) {
        try {
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!incomingRefreshToken) {
                return (0, ApiResponse_1.API_Response)(res, 401, false, "Unauthorized Request");
            }
            const decodedToken = (0, generatedToken_1.verifyToken)(incomingRefreshToken, env_1.config.REFRESH_TOKEN_SECRET, next);
            if (!decodedToken || typeof decodedToken !== "object") {
                return (0, ApiResponse_1.API_Response)(res, 403, false, "Invalid refresh token");
            }
            const user = await userService_1.UserService.findUserById(decodedToken.id);
            if (!user) {
                return (0, ApiResponse_1.API_Response)(res, 403, false, "Invalid refresh token");
            }
            // Use a secure comparison to prevent timing attacks
            const isTokenValid = user.refreshToken === incomingRefreshToken;
            if (!isTokenValid) {
                return (0, ApiResponse_1.API_Response)(res, 401, false, "Invalid or expired refresh token");
            }
            // Generate new tokens
            const { refreshToken, accessToken } = (0, generatedToken_1.generateTokens)({ id: user._id.toString(), email: user.email, role: user.role });
            // Update user's refresh token in the database
            user.refreshToken = refreshToken;
            await user.save();
            // Set new cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Ensure secure flag is enabled for HTTPS environments
                sameSite: "strict", // Prevent CSRF
            });
            return (0, ApiResponse_1.API_Response)(res, 200, true, "Token refreshed successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
;
