import { Document, Types } from "mongoose"

export interface ICrtItem {
    productID: Types.ObjectId,
    quantity: number,
}
export interface ICart extends Document {
    // The Document interface from Mongoose already includes the _id field by default
    user: Types.ObjectId,
    items: ICrtItem[],
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
}