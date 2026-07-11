/**
 * Customer Service
 *
 * Admin: list and view customer accounts.
 * Customer: read and update own profile (with avatar upload).
 */
import api from "../client";
import { MULTIPART } from "./config";
import type { Customer, PaginatedResponse, DetailResponse } from "./types";

export const customerService = {
  admin: {
    /** List all customers with pagination. */
    list: (params: { page: number; page_size: number }) =>
      api.get<PaginatedResponse<Customer>>("customerslist/", { params }),

    /** Get single customer by ID. */
    getById: (id: number | string) => api.get<DetailResponse<Customer>>(`customerslist/${id}/`),
  },

  customer: {
    /** Get own profile by customer ID. */
    profile: (id: number | string) => api.get<DetailResponse<Customer>>(`customerslist/${id}/`),

    /** Update own profile (multipart — supports avatar upload). */
    updateProfile: (id: number | string, payload: FormData) =>
      api.put(`customerdetails/${id}/`, payload, MULTIPART),

    /** Create profile details for first time (multipart). */
    createProfile: (payload: FormData) => api.post("customerdetails/", payload, MULTIPART),
  },
} as const;
