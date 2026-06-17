import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { checkout, getMyOrders, getOrderById } from "./order.controller";

const router = Router();

router.use(authenticate);

router.post("/checkout", checkout);
router.get("/", getMyOrders);
router.get("/:orderId", getOrderById);

export default router;