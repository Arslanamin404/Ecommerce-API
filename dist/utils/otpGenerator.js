"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify_OTP = exports.generate_hashed_OTP = exports.generate_OTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generate_OTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
exports.generate_OTP = generate_OTP;
const generate_hashed_OTP = async (input_OTP, next) => {
    try {
        return await bcrypt_1.default.hash(input_OTP, 10);
    }
    catch (error) {
        console.error("Error hashing OTP:", error);
        next(error);
    }
};
exports.generate_hashed_OTP = generate_hashed_OTP;
const verify_OTP = async (input_OTP, hashed_OTP, next) => {
    try {
        return await bcrypt_1.default.compare(input_OTP, hashed_OTP);
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        next(error);
    }
};
exports.verify_OTP = verify_OTP;
