import nodemailer from "nodemailer"
import { config } from "../config/env.ts"


export const sendEmail = async (email: string, subject: string, text: string): Promise<void> => {
    const transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST as string,
        port: Number(config.EMAIL_PORT),
        secure: false, // true for port 465, false for other ports
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: config.EMAIL_USER,
        to: email,
        subject,
        text,
    })
}