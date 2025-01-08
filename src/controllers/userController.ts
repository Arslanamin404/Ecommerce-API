import { NextFunction, raw, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { generate_hashed_OTP, generate_OTP, verify_OTP } from "../utils/otpGenerator";
import { config } from "../config/env";
import { sendEmail } from "../services/emailService";
import { UserService } from "../services/userService";
import { generateTokens } from "../utils/generatedToken";


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

    static async handle_update_profile(req: Request, res: Response, next: NextFunction) {
        try {
            const { first_name, last_name, pincode, state, city, gender } = req.body;

            const user = req.user;

            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            if (first_name) {
                user.first_name = first_name
            }

            if (last_name) {
                user.last_name = last_name
            }

            if (pincode) {
                user.pincode = pincode
            }

            if (state) {
                user.state = state
            }

            if (city) {
                user.city = city
            }

            if (gender) {
                user.gender = gender
            }

            await user.save();
            return API_Response(res, 200, true, "profile updated successfully", undefined, { user });

        } catch (error) {
            next(error);
        }
    }

    static async handle_update_email(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return API_Response(res, 400, false, "email field is required");
            }

            const existingUser = await UserService.checkExistingUser(email);
            if (existingUser) {
                return API_Response(res, 400, false, "Email already registered");
            }

            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            const raw_otp = generate_OTP();
            const otpExpiresAt = new Date(Date.now() + (config.OTP_EXPIRES))
            const hashedOTP = await generate_hashed_OTP(raw_otp, next)

            user.otp = hashedOTP;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();

            await sendEmail(email, "Verify Your New Email", `Your OTP is: ${raw_otp}.\nIts valid for 5 minutes only.`);

            return API_Response(res, 200, true, "OTP sent to your email. Please check your inbox.");
        } catch (error) {
            next(error)
        }
    }

    static async handle_verify_update_email_otp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body
            if (!email || !otp) {
                return API_Response(res, 400, false, "All fields are required");
            }

            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            if (!user.otp) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            const isOtpValid = await verify_OTP(otp, user.otp, next);
            if (!isOtpValid) {
                return API_Response(res, 400, false, "Invalid or expired OTP");
            }

            user.otp = undefined;
            user.otpExpiresAt = undefined;
            user.email = email


            // Generate tokens (refresh token -- Long Lived adn accessToken -- Short lived)
            const { refreshToken, accessToken } = generateTokens({ id: user._id.toString(), email: user.email, role: user.role });

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

            return API_Response(res, 200, true, "Email updated successfully");

        } catch (error) {
            next(error)
        }
    }

    static async handle_get_email(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            return API_Response(res, 200, true, `You Email is: '${user.email}'`);

        } catch (error) {
            next(error)
        }
    }

    static async handle_update_profile_picture(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return API_Response(res, 400, false, "No file uploaded")
            }

            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            // Construct file path
            const profilePicturePath = `/public/uploads/${req.file.filename}`;

            user.profilePicture = profilePicturePath;
            await user.save();

            return API_Response(res, 200, true, "Profile picture updated successfully.");

        } catch (error) {
            next(error)
        }
    }

    static async handle_get_profile_picture(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            return API_Response(res, 200, true, `profile_picture: '${user.profilePicture}'`);

        } catch (error) {
            next(error)
        }
    }
};