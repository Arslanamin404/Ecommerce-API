import { NextFunction, Request, Response } from "express";
import { API_Response } from '../utils/ApiResponse';
import { OrderService } from "../services/orderService";
import mongoose from "mongoose";


export class OrderController {
    static async handle_create_order(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the user ID from the request (ensure user is authenticated)
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            // Get paymentMethod and address from the request body
            const { paymentMethod, address } = req.body;

            // Validate input fields
            if (!paymentMethod || !address) {
                return API_Response(res, 400, false, "PaymentMethod and address is required.");
            }

            const order = await OrderService.createOrder(userID, paymentMethod, address);

            console.log("Order created successfully:", order);

            return API_Response(res, 200, true, "Order placed successfully.", undefined, { order });
        } catch (error) {
            console.error("Error in handle_create_order:", error);
            next(error);
        }
    }


    static async handle_get_order_by_id(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const { id } = req.params;

            const order = await OrderService.getOrderById(id);
            if (!order) {
                return API_Response(res, 400, false, "Order not found.");
            }

            return API_Response(res, 200, true, "Order retrieved successfully.", undefined, { order });
        } catch (error) {
            next(error)
        }
    };

    static async handle_get_all_orders(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const orders = await OrderService.getOrders();
            return API_Response(res, 200, true, "Orders retrieved successfully.", undefined, { orders });
        } catch (error) {
            next(error);
        }
    }



    static async handle_get_user_orders(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Test: handle_get_user_orders called");

            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }
            console.log(`User ID: ${userID}`);

            // Validate ObjectId format
            if (!mongoose.isValidObjectId(userID)) {
                return API_Response(res, 400, false, "Invalid user ID format.");
            }

            const orders = await OrderService.getUserOrders(userID);

            if (!orders || orders.length === 0) {
                return API_Response(res, 200, true, "No orders found.");
            }

            return API_Response(res, 200, true, "Orders retrieved successfully.", undefined, { orders });
        } catch (error) {
            console.error("Error in handle_get_user_orders:", error);
            next(error); // Pass error to error-handling middleware
        }
    }

    static async handle_update_order_status(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const { id } = req.params;
            const { status } = req.body

            if (!status) {
                return API_Response(res, 400, false, "Status is required.");
            }

            let order = await OrderService.updateOrderStatus(id, status);

            return API_Response(res, 200, true, "Order status updated.", undefined, { order });
        } catch (error) {
            next(error);
        }
    };

    static async handle_cancel_order(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }

            const { id } = req.params;

            let order = await OrderService.cancelOrder(userID, id);

            return API_Response(res, 200, true, "Order canceled.", undefined, { order });
        } catch (error) {
            next(error);
        }
    };

    static async handle_delete_order(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = req.user?.id;
            if (!userID) {
                return API_Response(res, 401, false, "Unauthorized access. Please log in.");
            }
            const { id } = req.params;

            // Fetch the user's cart
            const order = await OrderService.deleteOrder(id);
            if (!order) {
                return API_Response(res, 400, false, "Order not found.");
            }

            return API_Response(res, 200, true, "Order deleted.", undefined, { order });
        } catch (error) {
            next(error);
        }
    };
}