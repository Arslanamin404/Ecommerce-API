import express, { Application, Request, Response } from 'express';
import { connect_DB } from "./config/database"
import { config } from "./config/env"
import { ErrorHandler } from './middlewares/ErrorHandler';
import authRouter from './routes/authRoutes';
import cookieParser from "cookie-parser"
import userRouter from './routes/userRoutes';
import { authenticate } from './middlewares/authMiddleware';
import path from 'path';
import productRouter from './routes/productRoutes';
import categoryRouter from './routes/categoryRoutes';
import cartRouter from './routes/cartRoutes';
import orderRouter from './routes/orderRoutes';

const app: Application = express();

const PORT: string = config.PORT
const DB_URL: string = config.DB_URL


connect_DB(DB_URL)

app.use(express.static(path.resolve("./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authenticate, userRouter);
app.use("/api/v1/products", authenticate, productRouter);
app.use("/api/v1/categories", authenticate, categoryRouter);
app.use("/api/v1/cart", authenticate, cartRouter);
app.use("/api/v1/order", authenticate, orderRouter);

app.use(ErrorHandler)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});