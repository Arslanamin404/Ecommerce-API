import { model, Model, Schema } from "mongoose";
import { ICrtItem, ICart } from "../interfaces/ICart"
import { Product } from "./productModel";

const cartItemSchema: Schema<ICrtItem> = new Schema({
    productID: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, "Product is required"],
    },
    quantity: {
        type: Number,
        required: [true, "Product quantity is required"],
        min: 1
    },
})


const cartSchema: Schema<ICart> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "user is required"],
        unique: true
    },
    items: {
        type: [cartItemSchema],
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
}, { timestamps: true })


cartSchema.pre("save", async function (next) {
    // Cast `this` to the `ICart` type to ensure TypeScript understands the schema context.
    const cart = this as ICart;

    // Only recalculate totalPrice if items have been modified
    if (!cart.isModified("items")) {
        return next();
    }

    // Fetch prices for all products in the cart
    const productIds = cart.items.map(item => item.productID);
    const products = await Product.find({ _id: { $in: productIds } }).select("price");


    // Create a map of product prices for quick lookup
    const priceMap = new Map(products.map(product => [product.id.toString(), product.price]));

    // Calculate total price
    let total = 0;
    for (const item of cart.items) {
        const price = priceMap.get(item.productID.toString());
        if (!price) {
            return next(new Error(`Product with ID ${item.productID} not found`));
        }
        total += price * item.quantity;
    }
    cart.totalPrice = total;
    next();
});

export const CartItem = model<ICrtItem>("CartItem", cartItemSchema);
export const Cart = model<ICart>("Cart", cartSchema);