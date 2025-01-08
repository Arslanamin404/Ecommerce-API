import express, { Application, Request, Response } from 'express';
import { connect_DB } from "./config/database"
import { config } from "./config/env"
import { ErrorHandler } from './middlewares/ErrorHandler';
import authRouter from './routes/authRoutes';
import cookieParser from "cookie-parser"
import userRouter from './routes/userRoutes';
import { authenticate } from './middlewares/authMiddleware';
import path from 'path';

const app: Application = express();

const PORT: string = config.PORT
const DB_URL: string = config.DB_URL


connect_DB(DB_URL)

app.use(express.static(path.resolve("./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.get('/api/v1/status', (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK"
    })
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authenticate, userRouter);

app.use(ErrorHandler)
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});