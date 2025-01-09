import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { ProductService } from "../services/productService";
import { IProduct } from "../interfaces/IProduct";
import fs from "fs"
import { uploadToCloudinary } from "../utils/cloudinaryConfig";

export class ProductController {
    static async handle_get_all_products(req: Request, res: Response, next: NextFunction) {
        try {
            const products = await ProductService.fetchAllProducts();
            return API_Response(res, 200, true, "Products fetched successfully", undefined, { products });
        } catch (error) {
            next(error);
        }
    };

    static async handle_get_product_by_ID(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const product = await ProductService.fetchProductByID(id);
            return API_Response(res, 200, true, `Product fetched successfully`, undefined, { product });
        } catch (error) {
            next(error);
        }
    };

    static async handle_add_product(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, price, category, stock, images, rating, isHotDeal, isFeatured } = req.body;
            if (!name || !description || !price || !category || !images) {
                return API_Response(res, 400, false, "All fields are required");
            }

            // Check if files are uploaded
            if (!req.files || !(req.files instanceof Array)) {
                return API_Response(res, 400, false, "No files uploaded");
            }

            let imageUrls: string[] = [];
            const files = req.files as Express.Multer.File[];

            // Upload each file to Cloudinary
            for (const file of files) {
                const filePath = file.path;
                try {
                    const uploadResult = await uploadToCloudinary(filePath, "products");
                    if (uploadResult && uploadResult.secure_url) {
                        images.push(uploadResult.secure_url);
                    } else {
                        return API_Response(res, 500, false, "Failed to upload images to Cloudinary");
                    }
                } finally {
                    // Delete the file from local uploads folder
                    fs.unlinkSync(file.path);
                }
            }

            // Construct product data
            const productData: Partial<IProduct> = { name, description, category, stock, rating, isHotDeal, isFeatured, images: imageUrls };

            const new_product = await ProductService.createProduct(productData);
            return API_Response(res, 201, true, "Product added successfully", undefined, { new_product });
        } catch (error) {
            next(error);
        }
    };

    static async handle_update_product(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, description, price, category, stock, images, rating, isHotDeal, isFeatured } = req.body;
            const product = await ProductService.fetchProductByID(id);

            if (!product) {
                return API_Response(res, 404, false, `No product found with id: ${id}`)
            }

            if (name) {
                product.name = name
            }

            if (description) {
                product.description = description
            }

            if (price) {
                product.price = price
            }

            if (category) {
                product.category = category
            }

            if (stock) {
                product.stock = stock
            }

            if (rating) {
                product.rating = rating
            }

            if (isFeatured) {
                product.isFeatured = isFeatured
            }

            if (isHotDeal) {
                product.isHotDeal = isHotDeal
            }


            if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] }).images) {
                const newImageUrls: string[] = [];
                // Access the uploaded files in req.files and type assert it as an object where each field name contains an array of file objects
                const files = (req.files as { [fieldname: string]: Express.Multer.File[] }).images;

                // Upload each file to Cloudinary
                for (const file of files) {
                    const filePath = file.path;
                    try {
                        const uploadResult = await uploadToCloudinary(filePath, "products");
                        if (uploadResult && uploadResult.secure_url) {
                            images.push(uploadResult.secure_url);
                        } else {
                            return API_Response(res, 500, false, "Failed to upload images to Cloudinary");
                        }
                    } finally {
                        // Delete the file from local uploads folder
                        fs.unlinkSync(file.path);
                    }
                }

                // If product already has images, append new images to existing ones
                if (product.images && Array.isArray(product.images)) {
                    product.images.push(...newImageUrls); // Append new image URLs to existing images array
                } else {
                    product.images = newImageUrls; // If no images, set new images
                }
            }

            await product.save()

            return API_Response(res, 200, true, "Product updated successfully");
        } catch (error) {
            next(error);
        }
    };

    static async handle_delete_product(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const product = await ProductService.fetchProductByID(id);

            if (!product) {
                return API_Response(res, 404, false, `No product found with id: ${id}`)
            }
            await ProductService.deleteProductByID(id);

            return API_Response(res, 200, true, "Product deleted successfully");
        } catch (error) {
            next(error);
        }
    };
}