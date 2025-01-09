import { Document, Types } from "mongoose";

export interface ICategory extends Document {
    // The Document interface from Mongoose already includes the _id field by default
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
}