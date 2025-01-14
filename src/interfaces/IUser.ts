import { Document, Types } from "mongoose";


export interface IUser extends Document {
    _id: Types.ObjectId, // Explicitly type _id as ObjectId
    first_name: string,
    last_name?: string,
    email: string,
    password: string,
    profilePicture?: string,
    pincode?: number,
    state?: string,
    city?: string,
    gender?: "male" | "female",
    role: "user" | "admin",
    isVerified: boolean,
    refreshToken?: string,
    otp?: string,
    otpExpiresAt?: Date,
    createdAt: Date,
    updatedAt: Date,
    comparePassword(candidatePassword: string): Promise<Boolean>
}
