import { model, Model, Schema } from "mongoose"
import { ICategory } from "../interfaces/ICategory"

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

export const Category: Model<ICategory> = model("Category", categorySchema);