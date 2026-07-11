/**
 * Variant Service
 *
 * Admin: full CRUD for product variants (with image upload).
 * Shared: filter variants by parent product (used by both admin and customer).
 *
 * NOTE: The backend returns variants in inconsistent shapes depending on the
 * endpoint (paginated vs non-paginated). VariantListResponse accounts for this.
 */
import api from "../client";
import { MULTIPART } from "./config";
import type { VariantListResponse, DetailResponse, Variant, PaginationParams } from "./types";

export const variantService = {
  admin: {
    /** List all variants with pagination. */
    list: (params?: PaginationParams) =>
      api.get<VariantListResponse>("productvariant/", { params }),

    /** Get single variant by ID. */
    getById: (id: number | string) => api.get<DetailResponse<Variant>>(`productvariant/${id}/`),

    /** Create a new variant (multipart — supports image upload). */
    create: (payload: FormData) =>
      api.post<DetailResponse<Variant>>("productvariant/", payload, MULTIPART),

    /** Update a variant (multipart — supports image upload). */
    update: (id: number | string, payload: FormData) =>
      api.put<DetailResponse<Variant>>(`productvariant/${id}/`, payload, MULTIPART),

    /** Delete a variant. */
    delete: (id: number | string) => api.delete(`productvariant/${id}/`),
  },

  customer: {
    /** Get single variant by ID (public). */
    getById: (id: number | string) => api.get<DetailResponse<Variant>>(`productvariant/${id}/`),
  },

  /** Filter variants by parent product — used by both admin and customer. */
  filter: (parentId: number | string, params?: PaginationParams) =>
    api.get<VariantListResponse>("productvariantfilter/", {
      params: { parent_id: parentId, ...params },
    }),
} as const;
