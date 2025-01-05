import jwt, { JwtPayload } from "jsonwebtoken"
import { config } from "../config/env.ts"
import { NextFunction } from "express";

interface Payload {
    id: string;
    email: string;
}
export const generateToken = (payload: Payload): string => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

export const verifyToken = (token: string, next: NextFunction): JwtPayload | undefined => {
    try {
        return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    } catch (error) {
        next(error); // Pass the error to the next middleware
        return undefined; // Explicitly return undefined if an error occurs
    }
};