import dotenv from "dotenv"
dotenv.config()

export const config = {
    PORT: process.env.PORT || "3000",
    DB_URL: process.env.DB_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || "b3611747082753c56f27f361fa4c507bcc9ddb8dd4a3bd977a1f7ebb6d60d9e89d04549d1f587c8aee59890506a08ee825f15e79b3fcec0f6ab65eeacd0be5f995dd50ac926f3e97efb88c6ceab6d1d02dbfa0a2a3c67cc3141fea40c6f8931e0a51814c7424708af405f0d59834fb1ac8ebf45d208da6adafc4841856280b0653b399335c6780af79c8a6ecba44e0f33a77b4f3ac47a5418e83cf710200326c8f9c6f4fe9a2aa7b95dff989171265add807a6057368e2a1548a4c571195f4cc49233bc876e8a5f1617ec657bd8cec18d0e6c1f50d07761eaa3ce8d7338be46096152ab4e826b4c631bf9c2284b25749e4a18923101235845efc191a760efdbe",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "3d",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    OTP_EXPIRES: Number(process.env.OTP_EXPIRES) || 300000,
}