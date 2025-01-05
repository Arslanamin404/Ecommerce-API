import express, { Application, Request, Response } from 'express';
import { connect_DB } from "./config/database.ts"
import { config } from "./config/env.js"

const app: Application = express();
const PORT:string = config.PORT
const DB_URL: string = config.DB_URL


connect_DB(DB_URL)


app.get('/api/v1/status', (req: Request, res: Response) => {
    res.status(200).json({
        status: "OK"
    })
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});