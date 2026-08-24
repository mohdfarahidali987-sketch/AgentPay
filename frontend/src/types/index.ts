export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
};

export type CommerceIntent = {
  intent: string;
  query?: string;
  maxPrice?: number;
};

export type SearchResponse = {
  intent: CommerceIntent;
  products: Product[];
  count: number;
};