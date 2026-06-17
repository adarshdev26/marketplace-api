import { Request, Response, NextFunction } from "express";
import {
  checkoutOrder,
  getUserOrders,
  getUserOrderById,
} from "./order.service";
import { OrderParams } from "./order.types";

export async function checkout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await checkoutOrder(req.user!.userId);

    res.status(201).json({
      order,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await getUserOrders(req.user!.userId);

    res.status(200).json({
      orders,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(
  req: Request<OrderParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const order = await getUserOrderById(
      req.user!.userId,
      req.params.orderId
    );

    res.status(200).json({
      order,
    });
  } catch (err) {
    next(err);
  }
}