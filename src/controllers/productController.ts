import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { ProductService } from "../services/productService";
import { IProduct } from "../interfaces/IProduct";
import fs from "fs"
import { uploadToCloudinary } from "../utils/cloudinaryConfig";


export class ProductController {
    static async handle_get_all_products(req: Request, res: Response, next: NextFunction) {
        try {
            const { query, category, sort, search } = req.query as { query?: string; category?: string; sort?: string; search: string };

            // Record is a utility type that creates an object type with specific keys and values.
            const filter: Record<string, any> = {};
            let sortOptions: Record<string, 1 | -1> = {};


            if (query === "hot-deals") {
                filter.isHotDeal = true;
            } else if (query === "featured") {
                filter.isFeatured = true;
            }

            if (category) {
                filter.categoryID = category;
            }

            if (sort === "HTL") {
                sortOptions.price = -1;
            } else if (sort === "LTH") {
                sortOptions.price = 1;
            }

            // Match "name" with strings starting with the input (search query param)
            // ^ = starts with, "i" = ignore case

            // Match "name" with strings containing the input (case-insensitive)
            // $regex: `${search}` matches anywhere in the string $options: "i" = ignore case
            if (search) {
                filter.name = { $regex: `${search}`, $options: "i" };
            }

            const products = await ProductService.fetchProductByFilterAndSort(filter, sortOptions);

            if (!products || products.length === 0) {
                return API_Response(res, 404, false, "No products found");
            }

            return API_Response(res, 200, true, "Products fetched successfully", undefined, { products });
        } catch (error) {
            next(error);
        }
    }

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
            const user = req.user;
            if (!user) {
                return API_Response(res, 401, false, "Unauthorized: User not found.");
            }

            const { name, description, price, categoryID, stock, images, rating, isHotDeal, isFeatured } = req.body;

            if (!name || !description || !price || !categoryID) {
                return API_Response(res, 400, false, "All required fields (name, description, price, categoryID) must be provided");
            }

            let imageUrls: string[] = [];

            // Handle file uploads
            if (req.files && req.files instanceof Array && req.files.length > 0) {
                const files = req.files as Express.Multer.File[];
                for (const file of files) {
                    try {
                        const uploadResult = await uploadToCloudinary(file.path, "products");
                        if (uploadResult && uploadResult.secure_url) {
                            imageUrls.push(uploadResult.secure_url);
                        } else {
                            console.error(`Failed to upload ${file.path}`);
                        }
                    } finally {
                        fs.unlinkSync(file.path);
                    }
                }
            } else if (images && Array.isArray(images)) {
                imageUrls = images; // Use image URLs from request body if no files uploaded
            } else {
                return API_Response(res, 400, false, "Provide either image URLs or upload files.");
            }

            // Construct product data
            const productData: Partial<IProduct> = {
                name,
                description,
                price,
                categoryID,
                stock: stock || 0,
                rating: rating || 0,
                isHotDeal: isHotDeal || false,
                isFeatured: isFeatured || false,
                images: imageUrls,
            };

            const new_product = await ProductService.createProduct(productData);
            return API_Response(res, 201, true, "Product added successfully", undefined, { new_product });
        } catch (error) {
            next(error);
        }
    }

    static async handle_update_product(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            const { id } = req.params;
            const { name, description, price, categoryID, stock, images, rating, isHotDeal, isFeatured } = req.body;
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

            if (categoryID) {
                product.categoryID = categoryID
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
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

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