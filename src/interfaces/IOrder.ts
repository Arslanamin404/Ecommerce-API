import { Types } from "mongoose";

export interface IOrderItem {
    _id: Types.ObjectId;
    productID: Types.ObjectId;
    quantity: number;
    price: number;
    total: number;
}

export interface IAddress {
    street: string;
    city: string;
    state: string;
    pinCode: string,
    phoneNumber: string
}

export interface IOrder {
    _id: Types.ObjectId;
    userID: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number,
    status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
    paymentMethod: "cod" | "card" | "upi";
    paymentStatus: "paid" | "unpaid";
    address: IAddress;
    createdAt: Date,
    updatedAt: Date,
}