import { Category } from './../models/categoryModel';
import { ICategory } from './../interfaces/ICategory';


export class CategoryService {
    static async fetchAllCategories(): Promise<ICategory[]> {
        const categories = await Category.find();
        return categories;
    };

    static async fetchCategoryByID(id: string): Promise<ICategory | null> {
        return await Category.findById(id);
    };

    static async fetchCategoryByName(name: string): Promise<ICategory | null> {
        return await Category.findOne({ name });
    };

    static async deleteCategoryByID(id: string) {
        return await Category.deleteOne({ _id: id });
    };

    static async createCategory(categoryData: Partial<ICategory>): Promise<ICategory | null> {
        const new_category = await Category.create(categoryData);
        return new_category;
    };
}
