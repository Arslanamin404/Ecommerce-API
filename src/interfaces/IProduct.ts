import { Document, Types } from "mongoose";

export interface IProduct extends Document {
    _id: Types.ObjectId, // Explicitly type _id as ObjectId
    name: string,
    description: string,
    price: number,
    categoryID: Types.ObjectId,
    stock: number,
    images?: string[],
    rating: number,
    isHotDeal: boolean,
    isFeatured: boolean,
    createdAt: Date,
    updatedAt: Date,
}
