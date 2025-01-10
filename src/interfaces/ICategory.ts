import { Document, Types } from "mongoose";

export interface ICategory extends Document {
    _id: Types.ObjectId, // Explicitly type _id as ObjectId
    name: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
}