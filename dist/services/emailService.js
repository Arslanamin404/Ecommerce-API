"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const sendEmail = async (email, subject, text) => {
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.config.EMAIL_HOST,
        port: Number(env_1.config.EMAIL_PORT),
        secure: false, // true for port 465, false for other ports
        auth: {
            user: env_1.config.EMAIL_USER,
            pass: env_1.config.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: env_1.config.EMAIL_USER,
        to: email,
        subject,
        text,
    });
};
exports.sendEmail = sendEmail;
