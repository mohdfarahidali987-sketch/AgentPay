import { purchaseProduct } from "../services/order.service.js";

export async function createOrderForProduct(
  userId: string,
  productId: string
) {
  return purchaseProduct(
    userId,
    productId
  );
}