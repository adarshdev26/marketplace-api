import { Router } from "express";
import { login, signup, refresh, logout } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticate, (req, res) => {
    res.status(200).json({ user: req.user });
  });

export default router;
