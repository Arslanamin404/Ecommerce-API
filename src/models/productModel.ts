import mongoose, { model, Model, Schema } from "mongoose"
import { IProduct } from "../interfaces/IProduct"
import { Cart, CartItem } from "./cartModel";

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
    categoryID: {
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
        required: false
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
    },
    isHotDeal: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

productSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const productID = this._id;
        await CartItem.deleteMany({ productID });
        next();

    } catch (error) {
        next(error as Error)
    }
})


export const Product: Model<IProduct> = model("Product", productSchema)