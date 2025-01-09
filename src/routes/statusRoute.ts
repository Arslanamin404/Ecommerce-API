import { Router, Request, Response, NextFunction } from "express"
const statusRouter = Router();

statusRouter.get("/status", (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ status: "OK" });
    } catch (error) {
        next(error);
    }
});

export default statusRouter;