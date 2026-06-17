import prisma from "../../config/db";
import { createHttpError } from "src/utils/http-error";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

export async function addItemToCart(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw createHttpError("Product not found", 404);
  }

  const cart = await getOrCreateCart(userId);

  return prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);
  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } });
    return null;
  }

  return prisma.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity },
  });
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } });
}