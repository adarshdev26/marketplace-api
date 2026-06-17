import prisma from "../../config/db";
import { createHttpError } from "../../utils/http-error";

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserOrderById(
  userId: string,
  orderId: string
) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  return order;
}

export async function checkoutOrder(userId: string) {
    return prisma.$transaction(async (tx) => {
      // Get cart with products
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
  
      if (!cart || cart.items.length === 0) {
        throw createHttpError("Cart is empty", 400);
      }
  
      // Validate stock + calculate total
      let total = 0;
  
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw createHttpError(
            `Insufficient stock for ${item.product.title}`,
            400
          );
        }
  
        total += item.product.price * item.quantity;
      }
  
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
        },
      });
  
      // Create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
  
      // Reduce stock
      for (const item of cart.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
  
      // Clear cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
  
      return tx.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }