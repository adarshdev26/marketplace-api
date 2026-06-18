import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import carRoutes from './modules/cart/cart.routes'
import orderRoutes from './modules/order/order.routes'
import smsRoutes from './modules/sms/sms.routes'
import productRoutes from './modules/product/product.routes'

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", carRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/products", productRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const error = err instanceof Error ? err : new Error("Something went wrong");
  const statusCode =
    typeof err === "object" && err !== null && "statusCode" in err && typeof (err as { statusCode?: unknown }).statusCode === "number"
      ? (err as { statusCode: number }).statusCode
      : 500;

  console.error(error.stack);
  res.status(statusCode).json({
    message: error.message || "Something went wrong",
  });
});

export default app;
