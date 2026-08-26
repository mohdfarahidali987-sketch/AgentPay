type ProductForRanking = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  reviewCount: number;
  brand: string | null;
  attributes: unknown;
};

export type RankingPreference =
  | "QUALITY"
  | "PRICE"
  | "BALANCED";

export type RankedProduct =
  ProductForRanking & {
    aiScore: number;
    rankingReasons: string[];
  };


function calculateReviewConfidence(
  rating: number,
  reviewCount: number
): number {
  if (reviewCount <= 0) {
    return 0;
  }

  const globalMean = 4.0;
  const minimumReviews = 100;

  const weightedRating =
    (
      reviewCount * rating +
      minimumReviews * globalMean
    ) /
    (
      reviewCount + minimumReviews
    );

  return weightedRating / 5;
}


function calculatePriceScore(
  price: number,
  maxPrice?: number | null
): number {
  if (!maxPrice || maxPrice <= 0) {
    return 0.5;
  }

  const ratio = price / maxPrice;

  return Math.max(
    0,
    1 - ratio
  );
}


function calculateQualityScore(
  product: ProductForRanking
): number {
  const ratingScore =
    product.rating / 5;

  const reviewScore =
    calculateReviewConfidence(
      product.rating,
      product.reviewCount
    );

  return (
    ratingScore * 0.60 +
    reviewScore * 0.40
  );
}


function calculateBalancedScore(
  product: ProductForRanking,
  maxPrice?: number | null
): number {
  const ratingScore =
    product.rating / 5;

  const reviewScore =
    calculateReviewConfidence(
      product.rating,
      product.reviewCount
    );

  const priceScore =
    calculatePriceScore(
      product.price,
      maxPrice
    );

  const stockScore =
    product.stock > 0 ? 1 : 0;

  return (
    ratingScore * 0.35 +
    reviewScore * 0.25 +
    priceScore * 0.30 +
    stockScore * 0.10
  );
}


function calculatePricePriorityScore(
  product: ProductForRanking,
  maxPrice?: number | null
): number {
  const priceScore =
    calculatePriceScore(
      product.price,
      maxPrice
    );

  const stockScore =
    product.stock > 0 ? 1 : 0;

  const ratingScore =
    product.rating / 5;

  return (
    priceScore * 0.70 +
    stockScore * 0.10 +
    ratingScore * 0.20
  );
}


function calculateQualityPriorityScore(
  product: ProductForRanking,
  maxPrice?: number | null
): number {
  const qualityScore =
    calculateQualityScore(product);

  const priceScore =
    calculatePriceScore(
      product.price,
      maxPrice
    );

  const stockScore =
    product.stock > 0 ? 1 : 0;

  return (
    qualityScore * 0.75 +
    priceScore * 0.15 +
    stockScore * 0.10
  );
}


export function calculateProductScore(
  product: ProductForRanking,
  maxPrice?: number | null,
  preference: RankingPreference = "BALANCED"
): number {

  let score: number;

  switch (preference) {

    case "QUALITY":
      score =
        calculateQualityPriorityScore(
          product,
          maxPrice
        );
      break;

    case "PRICE":
      score =
        calculatePricePriorityScore(
          product,
          maxPrice
        );
      break;

    case "BALANCED":
    default:
      score =
        calculateBalancedScore(
          product,
          maxPrice
        );
      break;
  }

  return Number(
    score.toFixed(4)
  );
}


/*
 * Generate explanations from the actual
 * ranking signals.
 *
 * No LLM is used here, so the agent cannot
 * hallucinate why a product was selected.
 */
function generateRankingReasons(
  product: ProductForRanking,
  maxPrice: number | null | undefined,
  preference: RankingPreference
): string[] {

  const reasons: string[] = [];

  // Rating
  if (product.rating >= 4.5) {
    reasons.push(
      `Strong ${product.rating.toFixed(1)}★ rating`
    );
  } else if (product.rating >= 4.0) {
    reasons.push(
      `Good ${product.rating.toFixed(1)}★ rating`
    );
  }

  // Review confidence
  if (product.reviewCount >= 1000) {
    reasons.push(
      `Trusted by ${product.reviewCount.toLocaleString()} reviewers`
    );
  } else if (product.reviewCount >= 500) {
    reasons.push(
      `${product.reviewCount.toLocaleString()} customer reviews`
    );
  }

  // Price
  if (maxPrice && maxPrice > 0) {

    const percentage =
      Math.round(
        ((maxPrice - product.price) /
          maxPrice) *
          100
      );

    if (percentage >= 20) {
      reasons.push(
        `₹${product.price} is ${percentage}% below your ₹${maxPrice} budget`
      );
    } else {
      reasons.push(
        `Within your ₹${maxPrice} budget`
      );
    }
  }

  // Preference-specific reason
  if (preference === "QUALITY") {
    reasons.push(
      "Ranked using quality and review confidence"
    );
  }

  if (preference === "PRICE") {
    reasons.push(
      "Ranked with strong emphasis on price"
    );
  }

  if (preference === "BALANCED") {
    reasons.push(
      "Balanced across quality, price and availability"
    );
  }

  // Stock
  if (product.stock > 0) {
    reasons.push(
      "Currently in stock"
    );
  }

  // Brand
  if (product.brand) {
    reasons.push(
      `${product.brand} brand`
    );
  }

  return reasons.slice(0, 5);
}


export function rankProducts(
  products: ProductForRanking[],
  maxPrice?: number | null,
  preference: RankingPreference = "BALANCED"
): RankedProduct[] {

  return products
    .map((product) => {

      const aiScore =
        calculateProductScore(
          product,
          maxPrice,
          preference
        );

      const rankingReasons =
        generateRankingReasons(
          product,
          maxPrice,
          preference
        );

      return {
        ...product,
        aiScore,
        rankingReasons,
      };
    })
    .sort(
      (a, b) =>
        b.aiScore - a.aiScore
    );
}