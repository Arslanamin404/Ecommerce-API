"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
const generateTokens = (user) => {
    const accessToken = generateToken({ id: user.id.toString(), email: user.email, role: user.role }, env_1.config.ACCESS_TOKEN_SECRET, env_1.config.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = generateToken({ id: user.id.toString(), email: user.email, role: user.role }, env_1.config.REFRESH_TOKEN_SECRET, env_1.config.REFRESH_TOKEN_EXPIRES_IN);
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyToken = (token, secret, next) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
        return undefined; // Explicitly return undefined if an error occurs
    }
};
exports.verifyToken = verifyToken;
