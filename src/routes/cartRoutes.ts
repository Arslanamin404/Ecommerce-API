import { Request, Response, NextFunction, Router } from "express";
import { CartController } from "../controllers/cartController";

const cartRouter = Router();

// Add item to cart
cartRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
    CartController.handle_add_item_to_cart(req, res, next);
});

// Get cart items
cartRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
    CartController.handle_get_cart_items(req, res, next);
});

// Update item quantity in cart
cartRouter.patch("/:id", (req: Request, res: Response, next: NextFunction) => {
    CartController.handle_update_cart_item_quantity(req, res, next);
});

// Remove an item from the cart
cartRouter.delete("/remove-item/:id", (req: Request, res: Response, next: NextFunction) => {
    CartController.handle_remove_item_from_cart(req, res, next);
});

// Clear the cart
cartRouter.delete("/", (req: Request, res: Response, next: NextFunction) => {
    CartController.handle_clear_cart(req, res, next);
});

export default cartRouter;