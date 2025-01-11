import { Cart } from './../models/cartModel';
import { Product } from '../models/productModel';
import { Types } from 'mongoose';

export class CartService {

    static async addItemToCart(userID: string, productID: string, quantity: number) {
        // Convert productID to ObjectId if it's a string
        const productObjectId = new Types.ObjectId(productID);

        const product = await Product.findById(productObjectId)
        if (!product) {
            throw { status: 404, success: false, message: "Product not found" }
        }

        let cart = await Cart.findOne({ user: userID });
        if (!cart) {
            cart = new Cart({ user: userID, items: [] });
        }
        const existingItem = cart.items.find(item => item.productID.toString() === productID);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ _id: new Types.ObjectId(), productID: productObjectId, quantity })
        }

        return await cart.save();
    };

    static async getCartItems(userID: string) {
        const cart = await Cart.findOne({ user: userID }).populate("items.productID", "name price");
        if (!cart) {
            throw { status: 404, success: false, message: "Cart not found" }
        }

        // Remove items with null productID
        cart.items = cart.items.filter(item => item.productID !== null);
        return await cart.save();
    };

    static async updateCartItemQuantity(userID: string, itemId: string, quantity: number) {
        const cart = await Cart.findOne({ user: userID });
        if (!cart) {
            throw { status: 404, success: false, message: "Cart not found" }
        }

        const item = cart.items.find(item => item._id.toString() === itemId);

        if (!item) {
            throw { status: 404, success: false, message: "Item not found in cart" };
        }

        item.quantity = quantity;
        return await cart.save();
    }

    static async removeItemFromCart(userID: string, itemID: string) {
        const cart = await Cart.findOne({ user: userID });
        if (!cart) {
            throw { status: 404, success: false, message: "Cart not found" }
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemID);

        return cart.save();
    }

    static async clearCart(userID: string) {
        const cart = await Cart.findOne({ user: userID });
        if (!cart) {
            throw { status: 404, success: false, message: "Cart not found" }
        }

        cart.items = []
        return await cart.save();
    }

}
