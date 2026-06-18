import { Request, Response, NextFunction } from "express";
import { getProducts, getProductById } from "./product.service";
import { ProductParams } from "./product.types";
import { getPagination } from "../../utils/pagination";

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit, skip } = getPagination(
      Number(req.query.page),
      Number(req.query.limit)
    );

    const result = await getProducts(skip, limit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result.products,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(
  req: Request<ProductParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const product = await getProductById(
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
}