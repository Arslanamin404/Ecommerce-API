"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRouter = (0, express_1.Router)();
authRouter.post("/register", (req, res, next) => {
    authController_1.AuthController.handle_register_user(req, res, next);
});
authRouter.post("/verify-otp", (req, res, next) => {
    authController_1.AuthController.handle_verify_otp(req, res, next);
});
// todo: resend otp
authRouter.post("/login", (req, res, next) => {
    authController_1.AuthController.handle_login_user(req, res, next);
});
authRouter.post("/logout", (req, res, next) => {
    authController_1.AuthController.handle_logout_user(req, res, next);
});
authRouter.post("/refresh-token", (req, res, next) => {
    authController_1.AuthController.handle_refresh_accessToken(req, res, next);
});
exports.default = authRouter;
