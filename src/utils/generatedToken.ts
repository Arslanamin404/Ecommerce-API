import jwt, { JwtPayload } from "jsonwebtoken"
import { NextFunction } from "express";
import { config } from "../config/env";
import { ITokenPayload } from "../interfaces/ITokenPayload";

const generateToken = (payload: ITokenPayload, secret: string, expiresIn: string) => {
    return jwt.sign(payload, secret, { expiresIn });
};

export const generateTokens = (user: ITokenPayload) => {
    const accessToken = generateToken(
        { id: user.id.toString(), email: user.email, role: user.role },
        config.ACCESS_TOKEN_SECRET,
        config.ACCESS_TOKEN_EXPIRES_IN
    );
    const refreshToken = generateToken(
        { id: user.id.toString(), email: user.email, role: user.role },
        config.REFRESH_TOKEN_SECRET,
        config.REFRESH_TOKEN_EXPIRES_IN
    );
    return { accessToken, refreshToken };
}

export const verifyToken = (token: string, secret: string, next: NextFunction): JwtPayload | undefined => {
    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        next(error); // Pass the error to the next middleware
        return undefined; // Explicitly return undefined if an error occurs
    }
};