/** Flat shape the review admin UI renders — derived from the raw Feedback record. */
export interface NormalizedReview {
  id: number;
  product_name: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at?: string;
}

/**
 * The feedback API returns raw Prisma rows: `product.productName`,
 * `customer.fullName`, `isApproved`, `createdAt` — not the flat snake_case
 * fields the UI expects. Normalize once here instead of in every consumer.
 */
export function normalizeReview(raw: any): NormalizedReview {
  return {
    id: raw.id,
    product_name: raw.product?.productName ?? raw.productName ?? raw.product_name ?? "",
    user_name: raw.customer?.fullName ?? raw.customerName ?? raw.customer_name ?? raw.userName ?? raw.user_name ?? "",
    rating: raw.rating ?? 0,
    comment: raw.comment ?? "",
    is_approved: raw.isApproved ?? raw.is_approved ?? false,
    created_at: raw.createdAt ?? raw.created_at,
  };
}
