import { Document, Types } from "mongoose"

interface cartItem {
    product: Types.ObjectId,
    quantity: number,
}
export interface Cart extends Document {
    // The Document interface from Mongoose already includes the _id field by default
    user: Types.ObjectId,
    items: cartItem[],
    totalPrice: number,
    createdAt: Date,
    updatedAt: Date,
}