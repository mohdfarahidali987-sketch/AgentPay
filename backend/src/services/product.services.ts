import prisma from "../lib/prisma";

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
  });
}

export async function searchProducts(
  query: string,
  maxPrice?: number
) {
  return prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        ...(maxPrice !== undefined
          ? [
              {
                price: {
                  lte: maxPrice,
                },
              },
            ]
          : []),
        {
          stock: {
            gt: 0,
          },
        },
      ],
    },
 
  });
}