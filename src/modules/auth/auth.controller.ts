import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { loginUser, registerUser, refreshAccessToken, logoutUser } from "./auth.service";

const ALLOWED_SIGNUP_ROLES: Role[] = [Role.BUYER, Role.SELLER];

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

export async function signup(
  req: Request<unknown, unknown, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "name, email, and password are required" });
      return;
    }

    const safeRole = role && ALLOWED_SIGNUP_ROLES.includes(role as Role) ? (role as Role) : Role.BUYER;
    const user = await registerUser({ name, email, password, role: safeRole });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<unknown, unknown, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }
    await logoutUser(refreshToken);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}
