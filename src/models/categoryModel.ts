import { model, Model, Schema } from "mongoose"
import { ICategory } from "../interfaces/ICategory"
import { Product } from "./productModel";

const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Category description is required"],
        minLength: [80, 'Category description must be at least 80 characters long'],
        trim: true
    }
}, { timestamps: true })


categorySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const categoryID = this._id;
        // if a category is deleted, delete all the products Related to it
        await Product.deleteMany({ categoryID });
        next();

    } catch (error) {
        next(error as Error)
    }
})

export const Category: Model<ICategory> = model("Category", categorySchema);