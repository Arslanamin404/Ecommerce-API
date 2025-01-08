import { Request, Response, NextFunction, Router } from "express";
import { UserController } from "../controllers/userController";
import authRouter from "./authRoutes";
import { upload } from "../utils/multerConfig";

const userRouter = Router();

userRouter.get("/profile", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_get_profile(req, res, next)
});

userRouter.patch("/profile", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_update_profile(req, res, next)
});

userRouter.post("/update-email", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_update_email(req, res, next)
})

userRouter.post("/update-email-otp", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_verify_update_email_otp(req, res, next)
})

userRouter.get("/user-email", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_get_email(req, res, next)
});

userRouter.post("/profile-picture", upload.single("profile_picture"), (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_update_profile_picture(req, res, next)
});

userRouter.get("/profile-picture", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_get_profile_picture(req, res, next)
});



export default userRouter;