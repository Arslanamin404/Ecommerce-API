import { API_Response } from './../utils/ApiResponse';
import { Product } from './../models/productModel';
import { IProduct } from './../interfaces/IProduct';
import { Types } from 'mongoose';
import { Category } from '../models/categoryModel';



export class ProductService {
    static async fetchAllProducts(): Promise<IProduct[]> {
        const products = await Product.find().populate("categoryID", "name description");
        return products;
    };

    static async fetchProductByID(id: string): Promise<IProduct | null> {
        return await Product.findById(id);
    };

    static async fetchProductByCategoryID(categoryID: Types.ObjectId): Promise<IProduct[] | null> {
        return await Product.find({ categoryID });
    };

    static async fetchProductByFilterAndSort(filter: object, sortOptions: Record<string, 1 | -1>): Promise<IProduct[] | null> {
        return await Product.find(filter).sort(sortOptions).populate("categoryID", "name description");
    }

    static async deleteProductByID(id: string) {
        return await Product.deleteOne({ _id: id });
    };

    static async createProduct(productData: Partial<IProduct>): Promise<IProduct | null> {
        const category = await Category.findById(productData.categoryID);
        if (!category) {
            throw Error("Category does not exist")
        };
        const new_product = await Product.create(productData);
        return new_product;
    };
}
