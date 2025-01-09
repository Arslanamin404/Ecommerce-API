import mongoose, { model, Model, Schema } from "mongoose"
import { IProduct } from "../interfaces/IProduct"

const productSchema: Schema<IProduct> = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Product price cannot be negative"],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Product category is required"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock quantity is required"],
        default: 0,
        min: [0, "Stock quantity cannot be negative"],
    },
    images: {
        type: [String],
        required: [true, "Product images are required"],
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
    }
}, { timestamps: true })


export const Product: Model<IProduct> = model("Product", productSchema)