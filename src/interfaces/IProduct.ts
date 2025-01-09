import { Document, Types } from "mongoose";

export interface IProduct extends Document {
    // The Document interface from Mongoose already includes the _id field by default
    name: string,
    description: string,
    price: number,
    category: Types.ObjectId,
    stock: number,
    images: string[],
    rating: number,
    isHotDeal:boolean,
    createdAt: Date,
    updatedAt: Date,
}