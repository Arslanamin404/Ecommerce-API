import bcrypt from 'bcrypt';
import { NextFunction, raw, Request, Response } from "express";
import { User } from "../models/userModel.ts";
import { generateTokens, verifyToken } from '../utils/generatedToken.ts';
import { sendEmail } from '../services/emailService.ts';
import { generate_hashed_OTP, generate_OTP, verify_OTP } from '../utils/otpGenerator.ts';
import { config } from '../config/env.ts';
import { API_Response } from '../utils/ApiResponse.ts';
import { IUser } from '../interfaces/IUser.ts';
import { UserService } from '../services/userService.ts';

export class AuthController {
    static async handle_register_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { first_name, last_name, email, password } = req.body;

            if (!first_name || !email || !password) {
                return API_Response(res, 400, false, "All fields are required");
            }

            const existingUser = await UserService.checkExistingUser(email);
            if (existingUser) {
                return API_Response(res, 400, false, "User already registered");
            }

            const raw_otp = generate_OTP();
            const otpExpiresAt = new Date(Date.now() + (config.OTP_EXPIRES || 5 * 60 * 1000)); // OTP valid for 5 minutes
            const hashed_OTP = await generate_hashed_OTP(raw_otp, next)

            const new_user: IUser = new User({ first_name, last_name, email, password, otp: hashed_OTP, otpExpiresAt })
            await new_user.save()

            await sendEmail(email, "Verify Your Email", `Your OTP is: ${raw_otp}.\nIts valid for 5 minutes only.`);

            return API_Response(res, 201, true, "User registered. OTP sent to email.");
        } catch (error) {
            next(error);
        }
    };

    static async handle_verify_otp(req: Request, res: Response, next: NextFunction) {
        const { email, otp } = req.body
        try {
            if (!email || !otp) {
                return API_Response(res, 400, false, "All fields are required");
            }

            const user = await UserService.findUserByEmail(email);
            if (!user) {
                return API_Response(res, 401, false, "Invalid Credentials");
            }

            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            // Ensure `user.otp` is defined
            if (!user.otp) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            const isOtpValid = await verify_OTP(otp, user.otp, next);
            if (!isOtpValid) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();

            return API_Response(res, 200, true, "Email verified successfully");
        } catch (error) {
            next(error)
        }
    }

    static async handle_login_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return API_Response(res, 400, false, "All fields are required");
            }

            const user = await UserService.findUserByEmail(email);
            if (!user) {
                return API_Response(res, 401, false, "Invalid Credentials");
            }

            if (!user.isVerified) {
                return API_Response(res, 403, false, "Email not verified");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return API_Response(res, 401, false, "Invalid Credentials");
            }

            // Generate tokens (refresh token -- Long Lived adn accessToken -- Short lived)
            const { refreshToken, accessToken } = generateTokens({ id: user._id.toString(), email: user.email, role: user.role });

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

            return API_Response(res, 200, true, null);
        } catch (error) {
            next(error);
        }
    }

    static async handle_logout_user(req: Request, res: Response, next: NextFunction) {
        try {
            // Get refresh token from cookies or request body
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!incomingRefreshToken) {
                return API_Response(res, 400, false, "Refresh token is required for logout");
            }

            // Find user with the provided refresh token
            const user = await UserService.findUserByRefreshToken(incomingRefreshToken);
            if (!user) {
                return API_Response(res, 403, false, "Invalid refresh token");
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

            return API_Response(res, 200, true, "Logged out successfully");
        } catch (error) {
            next(error);
        }
    }

    static async handle_refresh_accessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!incomingRefreshToken) {
                return API_Response(res, 401, false, "Unauthorized Request");
            }

            const decodedToken = verifyToken(incomingRefreshToken, config.REFRESH_TOKEN_SECRET, next);

            if (!decodedToken || typeof decodedToken !== "object") {
                return API_Response(res, 403, false, "Invalid refresh token");
            }

            const user = await UserService.findUserById(decodedToken.id);

            if (!user) {
                return API_Response(res, 403, false, "Invalid refresh token");
            }

            // Use a secure comparison to prevent timing attacks
            const isTokenValid = user.refreshToken === incomingRefreshToken;

            if (!isTokenValid) {
                return API_Response(res, 401, false, "Invalid or expired refresh token");
            }

            // Generate new tokens
            const { refreshToken, accessToken } = generateTokens({ id: user._id.toString(), email: user.email, role: user.role });


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

            return API_Response(res, 200, true, "Token refreshed successfully");

        } catch (error) {
            next(error);
        }
    }

    // static async handle_get_profile(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const user = req.user;
    //         if (!user) {
    //             return API_Response(res, 404, false, "User not found.")
    //         }
    //         return API_Response(res, 200, true, "Profile fetched successfully.", null, {
    //             user
    //         });

    //     } catch (error) {
    //         next(error);
    //     }
    // }
};