/**
 * Contact Service
 *
 * Admin: list and view contact form submissions.
 * Customer: submit a contact form.
 */
import api from "../client";
import type { Contact, ContactPayload, ListResponse, DetailResponse } from "./types";

export const contactService = {
  admin: {
    /** List contact form submissions with pagination. */
    list: (params: { page: number; page_size: number }) =>
      api.get<ListResponse<Contact>>("contactus/", { params }),

    /** Get single contact submission by ID. */
    getById: (id: number | string) => api.get<DetailResponse<Contact>>(`contactus/${id}/`),
  },

  customer: {
    /** Submit a contact form. */
    create: (payload: ContactPayload) => api.post<DetailResponse<Contact>>("contactus/", payload),
  },
} as const;
