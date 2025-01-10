import { authorizeRole } from '../middlewares/authorizeRole';
import { CategoryController } from './../controllers/categoryController';
import { Request, Response, NextFunction, Router } from "express";


const categoryRouter = Router();



// get all categories
categoryRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
    CategoryController.handle_get_all_categories(req, res, next);
});

// fetch categories by id
categoryRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    CategoryController.handle_get_category_by_ID(req, res, next);
})

// add new categories (ADMIN ONLY)
categoryRouter.post("/", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    CategoryController.handle_add_category(req, res, next);
})

// update categories (ADMIN ONLY)
categoryRouter.patch("/:id", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    CategoryController.handle_update_category(req, res, next);
})

// delete categories (ADMIN ONLY)
categoryRouter.delete("/:id", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    CategoryController.handle_delete_category(req, res, next);
})


export default categoryRouter;