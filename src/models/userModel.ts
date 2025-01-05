import { Schema, Document, model, Model } from "mongoose";
import bcrypt from "bcrypt"
import validator from "validator";
const { isEmail } = validator

export interface IUser extends Document {
    first_name: string,
    last_name?: string,
    email: string,
    password: string,
    profile_url?: string,
    role: "user" | "admin",
    createdAt: Date,
    updatedAt: Date,
}

const userSchema: Schema<IUser> = new Schema({
    first_name: {
        type: String,
        required: [true, "first name is required"],
        minlength: [4, "first name must be at least 4 character long"]
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
    password: {
        type: String,
        required: [true, "password is required"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    profile_url: {
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

export const User: Model<IUser> = model("User", userSchema);
