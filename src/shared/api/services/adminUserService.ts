/**
 * Admin User Service
 *
 * CRUD operations for admin user accounts (admin panel only).
 */
import api from "../client";
import type { AdminUser, AdminCreatePayload, ListResponse, DetailResponse } from "./types";

export const adminUserService = {
  admin: {
    /** List all admin users. */
    list: () => api.get<ListResponse<AdminUser>>("adminsdetails/"),

    /** Get single admin user by ID. */
    getById: (id: number | string) => api.get<DetailResponse<AdminUser>>(`adminsdetails/${id}/`),

    /** Create a new admin user. */
    create: (payload: AdminCreatePayload) =>
      api.post<DetailResponse<AdminUser>>("adminsdetails/", payload),

    /** Update an existing admin user. */
    update: (id: number | string, payload: Partial<AdminCreatePayload>) =>
      api.put<DetailResponse<AdminUser>>(`adminsdetails/${id}/`, payload),

    /** Delete an admin user. */
    delete: (id: number | string) => api.delete(`adminsdetails/${id}/`),
  },
} as const;
