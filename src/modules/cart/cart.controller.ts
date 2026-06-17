import { Request, Response, NextFunction } from "express";
import { addItemToCart, getCart, updateCartItemQuantity, removeCartItem } from "./cart.service";
import { ProductParams, UpdateItemBody } from "./cart.types";

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "productId and a positive quantity are required" });
    }
    const cartItem = await addItemToCart(req.user!.userId, productId, quantity);
    res.status(201).json({ cartItem });
  } catch (err) {
    next(err);
  }
}

export async function viewCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await getCart(req.user!.userId);
    res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(
    req: Request<ProductParams, {}, UpdateItemBody>,
    res: Response,
    next: NextFunction) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ message: "quantity is required" });
    }
    const result = await updateCartItemQuantity(req.user!.userId, productId, quantity);
    res.status(200).json({ cartItem: result });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    await removeCartItem(req.user!.userId, productId as string);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
}