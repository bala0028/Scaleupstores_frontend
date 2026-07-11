/**
 * Notification Service
 *
 * Customer: list notifications, mark read, delete, clear all.
 */
import api from "../client";
import type { Notification, ListResponse } from "./types";

interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  total: number;
}

export const notificationService = {
  customer: {
    /** List all notifications for a customer. */
    list: (userId: number | string) =>
      api.get<NotificationListResponse>(`customer-notifications/${userId}/`),

    /** Mark a single notification as read. */
    markRead: (id: number | string) => api.put(`readnotifications/${id}/`),

    /** Mark all notifications as read for a customer. */
    markAllRead: (userId: number | string) => api.put(`readnotifications/all/${userId}/`),

    /** Delete a single notification. */
    delete: (id: number | string) => api.delete(`notification/${id}/`),

    /** Clear all notifications for a customer. */
    clearAll: (userId: number | string) => api.delete(`notifications/clear/${userId}/`),
  },
} as const;
