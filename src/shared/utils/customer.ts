/* Shared utility functions for customer pages */

/** Flexible interface for items with price fields (Product, Variant, CartItem) */
export interface PricedItem {
  price?: number | string | null;
  offer_price?: number | string | null;
  offer_percentage?: number | string | null;
  [key: string]: unknown;
}

/** Round half-up to N decimal places (used in Cart, Checkout, OrderConfirmation, OrderTracking) */
export function roundHalfUp(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Format product name: replace underscores, capitalize first letter */
export function formatProductName(text: string | undefined): string {
  if (!text) return "";
  const cleaned = text.replace(/_/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Truncate text to maxLen characters with ellipsis */
export function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
}

/** Get effective price for a product (offer price if available, else regular price) */
export function getEffectivePrice(product: PricedItem): {
  current: number;
  original: number | null;
  hasOffer: boolean;
  offerPercent: number;
} {
  const price = Number(product.price || 0);
  let offerPercent = Number(product.offer_percentage ?? product.offerPercentage ?? 0);
  let offerPrice = Number(product.offer_price ?? product.offerPrice ?? 0);

  if (offerPercent === 0 && Array.isArray(product.offers) && product.offers.length > 0) {
    const activeOffer = product.offers.find((o: any) => o && o.isActive !== false);
    if (activeOffer) {
      offerPercent = Number(activeOffer.offerPercentage ?? activeOffer.discountPercentage ?? activeOffer.offer_percentage ?? 0);
      if (offerPercent > 0 && offerPrice === 0) {
        offerPrice = price * (1 - offerPercent / 100);
      }
    }
  }

  const hasOffer = offerPercent > 0 && offerPrice > 0;

  return {
    current: hasOffer ? offerPrice : price,
    original: hasOffer ? price : null,
    hasOffer,
    offerPercent: Math.round(offerPercent),
  };
}

/** Build a full image URL — passes absolute URLs through, prepends VITE_API_URL for relative paths */
export function getImageUrl(img: string | null | undefined): string {
  if (!img) return "";
  return img.startsWith("http") ? img : `${import.meta.env.VITE_API_URL}${img}`;
}

/** Calculate order totals from cart items */
export function calcOrderTotals(
  items: Array<PricedItem & { qty: number }>,
  gstPercent: number,
  shippingCost: number
) {
  const subtotal = items.reduce((acc, item) => {
    const { current } = getEffectivePrice(item);
    return acc + current * item.qty;
  }, 0);

  const baseAmount = roundHalfUp((subtotal * 100) / (100 + gstPercent), 2);
  const gstAmount = roundHalfUp(subtotal - baseAmount, 2);
  const totalAmount = Math.round(subtotal + shippingCost);

  return { subtotal, baseAmount, gstAmount, shippingCost, totalAmount };
}
