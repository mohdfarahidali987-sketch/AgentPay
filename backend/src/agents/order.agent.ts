import { purchaseProduct } from "../services/order.service";

export async function createOrderForProduct(
  userId: string,
  productId: string
) {
  return purchaseProduct(
    userId,
    productId
  );
}