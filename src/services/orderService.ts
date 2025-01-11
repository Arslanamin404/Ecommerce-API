import mongoose from 'mongoose';
import { IAddress, IOrder, IOrderItem } from '../interfaces/IOrder';
import { Order } from '../models/orderModel';
import { Product } from '../models/productModel';
import { CartService } from './cartService';

type orderStatus = "pending" | "processing" | "shipped" | "delivered" | "canceled";

export class OrderService {

    static async createOrder(userID: string, paymentMethod: "card" | "cod" | "upi", address: IAddress) {
        // Fetch the user's active cart
        const cart = await CartService.getCartItems(userID);
        if (!cart || cart.items.length === 0) {
            throw { status: 400, message: "Cart is empty." };
        }

        // Validate stock for all items in the cart
        for (const item of cart.items) {
            const product = await Product.findById(item.productID);
            if (!product || product.stock < item.quantity) {
                throw { status: 400, message: `Product with ID "${item.productID}" is unavailable or out of stock.` };
            }
        }

        // Decrement stock for the items
        for (const item of cart.items) {
            // { stock: -item.quantity }: This tells MongoDB to decrement the stock field by the value of item.quantity.
            await Product.findByIdAndUpdate(item.productID, { $inc: { stock: -item.quantity } });
        }


        // Create the order and link it to the cart
        const order = await Order.create({
            userID,
            items: cart.items,
            paymentMethod,
            address,
        });
        console.log("Order created:", order);


        // Clear the user's cart
        const clearResult = await CartService.clearCart(userID);

        if (!clearResult || clearResult.items.length !== 0) {
            throw { status: 500, message: "Failed to clear the cart." };
        }

        console.log("Cart cleared successfully for user:", userID);

        return order;
    }

    static async getOrderById(orderID: string) {
        return await Order.findById(orderID).populate("userID", "name email") // Populate user info
            .populate("items.productID", "name price"); // Populate product info;
    };

    static async getOrders() {
        const order = await Order.find()
            .populate("userID", "name email") // Populate user info
            .populate("items.productID", "name price"); // Populate product info
        if (!order) {
            throw { status: 404, success: false, message: "Order not found" }
        }
        return order;
    };

    static async getUserOrders(userID: string) {
        try {
            console.log(` testing in service`);
            return await Order.find({ userID });
        } catch (error: any) {
            throw new Error(`Error fetching user orders: ${error.message}`);
        }
    };

    static async updateOrderStatus(orderID: string, status: orderStatus) {
        const order = await Order.findByIdAndUpdate(
            orderID,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            throw { status: 404, success: false, message: "Order not found." };
        }

        return order;
    }


    static async cancelOrder(userID: string, orderID: string) {
        const order = await Order.findOne({ _id: orderID, userID })

        if (!order) {
            throw { status: 404, success: false, message: "Order not found." };
        }

        if (order.status !== "pending") {
            throw { status: 400, success: false, message: "Order can not be canceled." };
        }

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productID, { $inc: { stock: item.quantity } });
        }


        order.status = "canceled";
        await order.save()

        return order;
    }


    static async deleteOrder(id: string) {
        const order = await Order.findById(id);

        if (!order) {
            throw { status: 404, message: 'Order not found.' };
        }

        // Restore stock for all items in the order
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productID, { $inc: { stock: item.quantity } });
        }

        // Delete the order
        await Order.findByIdAndDelete(id);

        return order;
    }
}
