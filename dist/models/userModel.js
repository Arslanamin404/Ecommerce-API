"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const { isEmail } = validator_1.default;
const userSchema = new mongoose_1.Schema({
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
    profile_url: {
        type: String,
        required: false
    }
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        this.password = await bcrypt_1.default.hash(this.password, 10);
        next();
    }
    catch (error) {
        next(error); // No TypeScript error
    }
});
exports.User = (0, mongoose_1.model)("User", userSchema);
