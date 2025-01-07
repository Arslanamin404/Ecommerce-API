import { Schema, model, Model } from "mongoose";
import bcrypt from "bcrypt"
import validator from "validator";
import { IUser } from "../interfaces/IUser";
const { isEmail } = validator


const userSchema: Schema<IUser> = new Schema({
    first_name: {
        type: String,
        required: [true, "first name is required"],
        minlength: [4, "first name must be at least 4 characters long"]
    },
    last_name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "enter a valid email address"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [7, "password must be al least 7 characters long"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    profilePicture_url: {
        type: String,
        required: false
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error as Error)  // No TypeScript error
    }
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<Boolean> {
    return await bcrypt.compare(candidatePassword, this.password)
}

export const User: Model<IUser> = model("User", userSchema);
