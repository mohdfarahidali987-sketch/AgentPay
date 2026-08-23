import {
  createPendingOrder,
} from "../services/order.service";

export async function createOrderForProduct(
  userId: string,
  productId: string
) {
  return createPendingOrder(
    userId,
    productId
  );
}