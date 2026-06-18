import { Request, Response } from "express";
import { sendSMS } from "./sms.service";

export const testSMS = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone } = req.body;
    const result = await sendSMS(
        phone,
        "Hello from Twilio 🚀"
      );

    res.status(200).json({
      success: true,
      sid: result.sid,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error,
    });
  }
};