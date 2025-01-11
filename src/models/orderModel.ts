import { Model, model, Schema } from "mongoose"
import { IAddress, IOrder, IOrderItem } from "../interfaces/IOrder"

const orderItemSchema = new Schema<IOrderItem>({
    productID: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product ID is required"]
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        default: 0,
    }
});


const addressSchema = new Schema<IAddress>({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
    },
});


const orderSchema = new Schema<IOrder>({
    userID: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    items: {
        type: [orderItemSchema],
        required: [true, "Items are required"]
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "canceled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "card", "upi"],
        required: [true, "Payment Method is required"]
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "unpaid"],
        default: "unpaid"
    },
    address: {
        type: addressSchema,
        required: [true, "Address is required"]
    },

}, { timestamps: true })



orderItemSchema.pre("save", function (next) {
    this.total = this.price * this.quantity;
    next();
})

orderSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0)
    next();
})


export const Order: Model<IOrder> = model("Order", orderSchema)