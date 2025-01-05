import bcrypt from 'bcrypt';
import { NextFunction, raw, Request, Response } from "express";
import { IUser, User } from "../models/userModel.ts";
import { generateToken } from '../utils/generatedToken.ts';
import { sendEmail } from '../services/emailService.ts';
import { generate_hashed_OTP, verify_OTP } from '../utils/otpGenerator.ts';
import { config } from '../config/env.ts';

export class AuthController {
    static async handle_register_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { first_name, last_name, email, password } = req.body;

            if (!first_name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already registered"
                })
            }

            const raw_otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + (config.OTP_EXPIRES || 5 * 60 * 1000)); // OTP valid for 5 minutes
            const hashed_OTP = await generate_hashed_OTP(raw_otp, next)

            const new_user: IUser = new User({ first_name, last_name, email, password, otp: hashed_OTP, otpExpiresAt })
            await new_user.save()

            await sendEmail(email, "Verify Your Email", `Your OTP is: ${raw_otp}.\nIts valid for 5 minutes.`);

            return res.status(201).json({
                success: true,
                message: "User registered. OTP sent to email."
            });
        } catch (error) {
            next(error);
        }
    };

    static async handle_verify_otp(req: Request, res: Response, next: NextFunction) {
        const { email, otp } = req.body
        try {
            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Credentials"
                });
            }

            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return res.status(400).json({
                    success: false,
                    // message: "OTP has expired."
                    message: "Invalid or expired OTP."
                })
            }

            // Ensure `user.otp` is defined
            if (!user.otp) {
                return res.status(400).json({
                    success: false,
                    message: `No OTP found for email.`,
                });
            }

            const isOtpValid = await verify_OTP(otp, user.otp, next);
            if (!isOtpValid) {
                return res.status(400).json({
                    success: false,
                    // message: `Invalid OTP.`,
                    message: "Invalid or expired OTP."
                });
            }

            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();

            return res.status(200).json({
                success: true,
                message: `Email verified successfully.`,
            })

        } catch (error) {
            next(error)
        }
    }

    static async handle_login_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                })
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Credentials"
                })
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Credentials"
                })
            }
            // Generate token
            const token = generateToken({ id: user._id.toString(), email: user.email })

            return res.status(200).json({
                success: true,
                token
            })

        } catch (error) {
            next(error);
        }
    }
};