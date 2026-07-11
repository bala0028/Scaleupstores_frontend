import type { Product } from "@/shared/api/services/types";
import type { CartItem } from "@/shared/stores";

/**
 * Convert a Product to CartItem format for cart operations
 */
export function productToCartItem(product: Product): CartItem {
  return {
    id: product.id,
    qty: 1,
    product_name: product.product_name || product.name,
    price: product.price,
    product_image: product.product_image,
    stock_quantity: product.stock_quantity,
  };
}
