/**
 * Category Service
 *
 * Admin: full CRUD for categories (with image upload).
 * Customer: read-only category lists for navigation and browsing.
 */
import api from "../client";
import { MULTIPART } from "./config";
import type { Category, ListResponse, DetailResponse } from "./types";

export const categoryService = {
  admin: {
    /** List all categories. */
    list: () => api.get<ListResponse<Category>>("categories/"),

    /** Get single category by ID. */
    getById: (id: number | string) => api.get<DetailResponse<Category>>(`categories/${id}`),

    /** Create a new category (multipart — supports image upload). */
    create: (payload: FormData) =>
      api.post<DetailResponse<Category>>("categories/", payload, MULTIPART),

    /** Update a category (multipart — supports image upload). */
    update: (id: number | string, payload: FormData) =>
      api.put<DetailResponse<Category>>(`categories/${id}/`, payload, MULTIPART),

    /** Delete a category. */
    delete: (id: number | string) => api.delete(`categories/${id}`),
  },

  customer: {
    /** List active categories for storefront navigation. */
    list: () => api.get<ListResponse<Category>>("categorylist/"),

    /** List all categories (used by About page). */
    all: () => api.get<ListResponse<Category>>("categories/"),

    /** Get single category by ID (public). */
    getById: (id: number | string) => api.get<DetailResponse<Category>>(`categorylist/${id}/`),
  },
} as const;
