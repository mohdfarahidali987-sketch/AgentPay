import {
  searchProducts,
} from "../services/product.services.js";

import {
  rankProducts,
  type RankingPreference,
} from "../services/product-ranking.js";

export async function findProducts(
  query: string,
  maxPrice?: number | null,
  preference: RankingPreference = "BALANCED"
) {
  if (!query.trim()) {
    return [];
  }

  const products =
    await searchProducts(
      query,
      maxPrice ?? undefined
    );

  return rankProducts(
    products,
    maxPrice,
    preference
  );
}