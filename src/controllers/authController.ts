import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/userModel.ts";

export class AuthController {
    static async handle_register_user(req: Request, res: Response, next: NextFunction) {
        try {
            const { first_name, last_name, email, password } = req.body

            if (!first_name || !email || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({
                    message: "User already registered"
                })
            }

            const new_user: IUser = new User({ first_name, last_name, email, password })
            await new_user.save()

            return res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            next(error);
        }
    };

    static async handle_login_user(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json({ message: "Token" });
        } catch (error) {
            next(error);
        }
    }
};