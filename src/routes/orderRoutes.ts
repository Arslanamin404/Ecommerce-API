import { Request, Response, NextFunction, Router } from "express";
import { OrderController } from "../controllers/orderController";
import { authorizeRole } from "../middlewares/authorizeRole";


const orderRouter = Router();

// create Order
orderRouter.post("/create", (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_create_order(req, res, next)
});

// Get all orders
orderRouter.get("/", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_get_all_orders(req, res, next);

});

// Get Order by id
orderRouter.get("/:id", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_get_order_by_id(req, res, next);
});

// Get all orders(for auth user)
orderRouter.get("/user", (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_get_user_orders(req, res, next);
});

// Update Order Status
orderRouter.patch("/:id/status", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_update_order_status(req, res, next)
});


// cancel Order 
orderRouter.patch("/:id/cancel", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_cancel_order(req, res, next)
});

// Delete Order
orderRouter.delete("/:id", authorizeRole(["admin"]), (req: Request, res: Response, next: NextFunction) => {
    OrderController.handle_delete_order(req, res, next)
});

export default orderRouter;