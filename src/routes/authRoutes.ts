import { Request, Response, NextFunction, Router } from "express";
import { AuthController } from "../controllers/authController.ts";

const authRouter = Router();

authRouter.post("/register", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_register_user(req, res, next)
});
authRouter.post("/verify-otp", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_verify_otp(req, res, next)
});
authRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_login_user(req, res, next)
});

export default authRouter;