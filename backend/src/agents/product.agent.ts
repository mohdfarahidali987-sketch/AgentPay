import {
  searchProducts,
} from "../services/product.services.js";

export async function findProducts(
  query: string,
  maxPrice?: number | null
) {
  if (!query.trim()) {
    return [];
  }

  const products = await searchProducts(
    query,
    maxPrice ?? undefined
  );

  return products;
}