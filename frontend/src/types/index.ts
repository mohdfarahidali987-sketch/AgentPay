export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  reviewCount: number;
  brand: string | null;
  attributes: Record<string, unknown> | null;
  aiScore?: number;
  rankingReasons?: string[];
};

export type CommerceIntent = {
  intent: string;
  query?: string;
  maxPrice?: number | null;
  preference?: "QUALITY" | "PRICE" | "BALANCED";
  response?: string;
};

export type SearchResponse = {
  intent: CommerceIntent;
  products: Product[];
  count: number;
};