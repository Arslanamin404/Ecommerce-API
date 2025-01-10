import { Document, Types } from "mongoose"

export interface ICrtItem {
    productID: Types.ObjectId,
    quantity: number,
}
export interface ICart extends Document {
    _id: Types.ObjectId, // Explicitly type _id as ObjectId
    user: Types.ObjectId,
    items: ICrtItem[],
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
}