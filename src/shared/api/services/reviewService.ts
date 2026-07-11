/**
 * Review Service
 *
 * Admin: list, view, approve/reject, and delete product reviews.
 * Customer: view reviews, submit feedback, rating summary, paginated reviews.
 */
import api from "../client";
import type {
  Review,
  ReviewPayload,
  RatingSummary,
  AdminReviewParams,
  ListResponse,
  DetailResponse,
  PaginatedResponse,
} from "./types";

export const reviewService = {
  admin: {
    /** List all reviews with optional filters (category, product, pagination). */
    list: (params?: AdminReviewParams) =>
      api.get<ListResponse<Review>>("admin-feedback-list/", { params }),

    /** Get single review detail. */
    detail: (id: number | string) => api.get<DetailResponse<Review>>(`admin-feedback/${id}/`),

    /** Approve or reject a review. */
    approve: (id: number | string, payload: { action: string }) =>
      api.post(`admin-approval/${id}/`, payload),

    /** Delete a review. */
    delete: (id: number | string) => api.delete(`admin-feedback-delete/${id}/`),
  },

  customer: {
    /** Get existing review for a product (check if user already reviewed). */
    getByProduct: (productId: number | string) =>
      api.get<DetailResponse<Review>>(`feedback/${productId}/`),

    /** Submit a new review for a product. */
    create: (productId: number | string, payload: ReviewPayload) =>
      api.post(`feedback/${productId}/`, payload),

    /** Get rating summary (average, distribution) for a product. */
    ratingSummary: (productId: number | string) =>
      api.get<RatingSummary>(`product-rating-summary/${productId}/`),

    /** Get paginated reviews for a product, optionally filtered by star rating. */
    paginated: (productId: number | string, page = 1, rating?: number) =>
      api.get<PaginatedResponse<Review>>(`product-feedback-filter/${productId}/`, {
        params: { page, ...(rating != null && { rating }) },
      }),
  },
} as const;
