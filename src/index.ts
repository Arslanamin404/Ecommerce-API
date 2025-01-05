import express, { Application, Request, Response } from 'express';
import { connect_DB } from "./config/database.ts"
import { config } from "./config/env.ts"
import { ErrorHandler } from './middlewares/ErrorHandler.ts';
import authRouter from './routes/authRoutes.ts';

const app: Application = express();

const PORT: string = config.PORT
const DB_URL: string = config.DB_URL


connect_DB(DB_URL)

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.get('/api/v1/status', (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK"
    })
});

app.use("/api/v1/auth", authRouter);

app.use(ErrorHandler)
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});