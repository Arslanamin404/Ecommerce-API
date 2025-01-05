import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/userModel.ts";
import { generateToken } from '../utils/generatedToken.ts';

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

            const new_user: IUser = new User({ first_name, last_name, email, password })
            await new_user.save()

            return res.status(201).json({
                success: true,
                message: "User registered successfully"
            });
        } catch (error) {
            next(error);
        }
    };

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