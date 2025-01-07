import { Request } from 'express';
import { IUser } from '../interfaces/IUser';

// By extending Express.Request, TypeScript understands that req.user exists and is of type IUser.

declare global {
    namespace Express {
        export interface Request {
            user?: IUser;
        }
    }
}