import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';


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
};