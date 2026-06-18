import { Router } from "express";
import {
  getAllProducts,
  getProduct,
} from "./product.controller";

const router = Router();

router.get("/", getAllProducts);

router.get("/:productId", getProduct);

export default router;