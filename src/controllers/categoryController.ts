import { ICategory } from './../interfaces/ICategory';
import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
    static async handle_get_all_categories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await CategoryService.fetchAllCategories()
            return API_Response(res, 200, true, "Categories fetched successfully", undefined, { categories });
        } catch (error) {
            next(error);
        }
    };

    static async handle_get_category_by_ID(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const category = await CategoryService.fetchCategoryByID(id);
            if (!category) {
                return API_Response(res, 404, true, `No category found with id ${id}`);
            }
            return API_Response(res, 200, true, `Category fetched successfully`, undefined, { category });
        } catch (error) {
            next(error);
        }
    };

    static async handle_add_category(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description } = req.body as { name: string; description: string };

            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            if (!name || !description) {
                return API_Response(res, 400, false, "All fields are required");
            }

            // Construct product data
            const categoryData: Partial<ICategory> = { name, description };

            const new_category = await CategoryService.createCategory(categoryData);
            return API_Response(res, 201, true, "Category added successfully", undefined, { new_category });
        } catch (error) {
            next(error);
        }
    };

    static async handle_update_category(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            const { id } = req.params;
            const { name, description } = req.body as { name: string; description: string };
            const category = await CategoryService.fetchCategoryByID(id);

            if (!category) {
                return API_Response(res, 404, false, `No category found with id: ${id}`)
            }

            if (name) {
                category.name = name
            }

            if (description) {
                category.description = description
            }

            await category.save()

            return API_Response(res, 200, true, "Category updated successfully");
        } catch (error) {
            next(error);
        }
    };

    static async handle_delete_category(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            if (!user) {
                return API_Response(res, 404, false, "User not found.")
            }

            const { id } = req.params;
            const category = await CategoryService.fetchCategoryByID(id);

            if (!category) {
                return API_Response(res, 404, false, `No category found with id: ${id}`)
            }
            await CategoryService.deleteCategoryByID(id);

            return API_Response(res, 200, true, "Category deleted successfully");
        } catch (error) {
            next(error);
        }
    };
}

