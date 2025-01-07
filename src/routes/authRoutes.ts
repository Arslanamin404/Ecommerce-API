import { Request, Response, NextFunction, Router } from "express";
import { AuthController } from "../controllers/authController";


const authRouter = Router();

authRouter.post("/register", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_register_user(req, res, next)
});
authRouter.post("/verify-otp", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_verify_otp(req, res, next)
});
// todo: resend otp
authRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_login_user(req, res, next)
});
authRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_logout_user(req, res, next)
});
authRouter.post("/refresh-token", (req: Request, res: Response, next: NextFunction) => {
    AuthController.handle_refresh_accessToken(req, res, next)
});



export default authRouter;