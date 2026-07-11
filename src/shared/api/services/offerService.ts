/**
 * Offer Service
 *
 * Admin: full CRUD for product offers + filter by category.
 * Customer: public active offers.
 */
import api from "../client";
import type { Offer, OfferPayload, ListResponse, DetailResponse } from "./types";

export const offerService = {
  admin: {
    /** List all offers (admin). */
    list: () => api.get<ListResponse<Offer>>("offers/"),

    /** Get single offer by ID (admin). */
    getById: (id: number | string) => api.get<DetailResponse<Offer>>(`offers/${id}/`),

    /** Create offer(s) (admin). */
    create: (payload: OfferPayload | OfferPayload[]) =>
      api.post<DetailResponse<Offer>>("offers/", payload),

    /** Update an existing offer (admin). */
    update: (id: number | string, payload: Partial<OfferPayload>) =>
      api.put<DetailResponse<Offer>>(`offers/${id}/`, payload),

    /** Delete an offer (admin). */
    delete: (id: number | string) => api.delete(`offers/${id}/`),

    /** List offers filtered by category (admin). */
    byCategory: (catId: number | string) =>
      api.get<ListResponse<Offer>>(`offers/category/${catId}/`),

    /** List all products for "Select All" category (admin). */
    allProducts: () => api.get<ListResponse<Offer>>(`offers/products/all`),
  },

  customer: {
    /** List active public offers (customer). */
    list: () => api.get<ListResponse<Offer>>("offers/public"),
  },
} as const;
