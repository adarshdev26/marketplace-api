import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role, type User } from "@prisma/client";
import prisma from "../../config/db";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type PublicUser = Omit<User, "password">;

function toPublicUser(user: User): PublicUser {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function createHttpError(message: string, statusCode: number): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser({
  name,
  email,
  password,
  role,
}: RegisterUserInput): Promise<PublicUser> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw createHttpError("User already exists with this email", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  return toPublicUser(user);
}

export async function loginUser({
  email,
  password,
}: LoginUserInput): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function refreshAccessToken(
  rawRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw createHttpError("Invalid or expired refresh token", 401);
  }

  if (typeof decoded === "string" || !decoded.userId) {
    throw createHttpError("Invalid refresh token", 401);
  }

  const hashedToken = hashToken(rawRefreshToken);
  const storedToken = await prisma.refreshToken.findUnique({ where: { token: hashedToken } });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw createHttpError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
  if (!user) {
    throw createHttpError("User no longer exists", 401);
  }

  // Rotation: kill the old token, issue a fresh pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: hashToken(newRefreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(rawRefreshToken: string): Promise<void> {
  const hashedToken = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { token: hashedToken },
    data: { revoked: true },
  });
}