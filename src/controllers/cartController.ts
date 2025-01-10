import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { CartService } from "../services/cartService";



export class CartController {
    static async handle_add_item_to_cart(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the user ID from the request (ensure user is authenticated)
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            // Get productID and quantity from the request body
            const { productID, quantity } = req.body;

            // Validate input fields
            if (!productID || !quantity || quantity <= 0) {
                return API_Response(res, 400, false, "Product ID and quantity are required, and quantity must be greater than zero.");
            }

            const cart = await CartService.addItemToCart(userID, productID, quantity);

            // Return the updated cart
            return API_Response(res, 200, true, "Item added to cart.", undefined, { cart });
        } catch (error) {
            next(error);
        }
    }

    static async handle_get_cart_items(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const cart = await CartService.getCartItems(userID);

            return API_Response(res, 200, true, "Cart items retrieved successfully.", undefined, { cart });
        } catch (error) {
            next(error)
        }
    };

    static async handle_update_cart_item_quantity(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const { id } = req.params;
            const { quantity } = req.body;

            // Validate input fields
            if (!quantity || quantity <= 0) {
                return API_Response(res, 400, false, "Product quantity is required.");
            }
            const cart = await CartService.updateCartItemQuantity(userID, id, quantity);
            return API_Response(res, 200, true, "Item quantity updated successfully.", undefined, { cart });
        } catch (error) {
            next(error);
        }
    }

    static async handle_remove_item_from_cart(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the user ID from the request (ensure user is authenticated)
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const { id } = req.params;

            let cart = await CartService.removeItemFromCart(userID, id);

            return API_Response(res, 200, true, "Item removed from cart.", undefined, { cart });
        } catch (error) {
            next(error);
        }
    };

    static async handle_clear_cart(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the user ID from the request (ensure user is authenticated)
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            // Fetch the user's cart
            const cart = await CartService.clearCart(userID);

            return API_Response(res, 200, true, "Cart cleared.", undefined, { cart });
        } catch (error) {
            next(error);
        }
    };
}