import bcrypt from 'bcrypt';
import { NextFunction, raw, Request, Response } from "express";
import { IUser, User } from "../models/userModel.ts";
import { generateToken } from '../utils/generatedToken.ts';
import { sendEmail } from '../services/emailService.ts';
import { generate_hashed_OTP, verify_OTP } from '../utils/otpGenerator.ts';
import { config } from '../config/env.ts';
import { API_Response } from '../utils/ApiResponse.ts';

export class AuthController {
    static async handle_register_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { first_name, last_name, email, password } = req.body;

            if (!first_name || !email || !password) {
                return API_Response(res, 400, false, "All fields are required");
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return API_Response(res, 400, false, "User already registered");
            }

            const raw_otp = Math.floor(100000 + Math.random() * 900000).toString();
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

            const user = await User.findOne({ email });
            if (!user) {
                return API_Response(res, 401, false, "Invalid Credentials");
            }

            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            // Ensure `user.otp` is defined
            if (!user.otp) {
                return API_Response(res, 400, false, "No OTP found for email");
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

            const user = await User.findOne({ email });
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

            // Generate token
            const token = generateToken({ id: user._id.toString(), email: user.email })

            return API_Response(res, 200, true, null, token);
        } catch (error) {
            next(error);
        }
    }
};