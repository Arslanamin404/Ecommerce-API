import { Request, Response, NextFunction, Router } from "express";
import { UserController } from "../controllers/userController";

const userRouter = Router();

userRouter.get("/profile", (req: Request, res: Response, next: NextFunction) => {
    UserController.handle_get_profile(req, res, next)
});



export default userRouter;