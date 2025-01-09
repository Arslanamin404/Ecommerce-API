import { Request, Response, NextFunction, Router } from "express";
import { ProductController } from "../controllers/productController";
import { upload } from "../utils/multerConfig";

const productRouter = Router();



// get all products
productRouter.get("/all", (req: Request, res: Response, next: NextFunction) => {
    ProductController.handle_get_all_products(req, res, next);
});

// fetch product by id
productRouter.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    ProductController.handle_get_product_by_ID(req, res, next);
})

// add new product (ADMIN ONLY)
productRouter.post("/", upload.array("images", 5), (req: Request, res: Response, next: NextFunction) => {
    ProductController.handle_add_product(req, res, next);
})

// update product (ADMIN ONLY)
productRouter.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
    ProductController.handle_update_product(req, res, next);
})

// delete product (ADMIN ONLY)
productRouter.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    ProductController.handle_delete_product(req, res, next);
})


export default productRouter;