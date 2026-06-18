import { Router } from "express";
import { testSMS } from "./sms.controller";

const router = Router();

router.get("/test", testSMS);

export default router;