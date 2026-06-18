import prisma from "../../config/db";
import { createHttpError } from "../../utils/http-error";

export async function getProducts(
    skip: number,
    limit: number
  ) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
  
      prisma.product.count(),
    ]);
  
    return {
      products,
      total,
    };
  }

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!product) {
    throw createHttpError("Product not found", 404);
  }

  return product;
}
