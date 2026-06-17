import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { addItem, viewCart, updateItem, removeItem } from "./cart.controller";

const router = Router();

router.use(authenticate);

router.post("/", addItem);
router.get("/", viewCart);
router.patch("/:productId", updateItem);
router.delete("/:productId", removeItem);

export default router;