import { Product } from './../models/productModel';
import { IProduct } from './../interfaces/IProduct';



export class ProductService {
    static async fetchAllProducts(): Promise<IProduct[]> {
        const products = await Product.find();
        return products;
    };

    static async fetchProductByID(id: string): Promise<IProduct | null> {
        return await Product.findById(id);
    };

    static async deleteProductByID(id: string) {
        return await Product.deleteOne({ _id: id });
    };

    static async createProduct(productData: Partial<IProduct>): Promise<IProduct | null> {
        const new_product = await Product.create(productData);
        return new_product;
    };
}
