import crypto from "crypto"
import bcrypt from "bcrypt"
import { NextFunction } from "express"

export const generate_OTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
}



export const generate_hashed_OTP = async (input_OTP: string, next: NextFunction): Promise<string | undefined> => {
    try {
        return await bcrypt.hash(input_OTP, 10);
    } catch (error) {
        console.error("Error hashing OTP:", error);
        next(error)
    }
}


export const verify_OTP = async (input_OTP: string, hashed_OTP: string, next: NextFunction): Promise<boolean | void> => {
    try {
        return await bcrypt.compare(input_OTP, hashed_OTP)
    } catch (error) {
        console.error("Error verifying OTP:", error);
        next(error)
    }
}

