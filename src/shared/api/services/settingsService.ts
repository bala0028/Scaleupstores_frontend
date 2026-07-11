/**
 * Settings Service
 *
 * Admin: update GST percentage and courier charge.
 * Shared: both admin and customer read GST and courier charge.
 */
import api from "../client";
import type {
  GstResponse,
  CourierResponse,
  CourierChargeSlab,
  DashboardSectionVisibility,
  ListResponse,
  DetailResponse,
} from "./types";

export const settingsService = {
  admin: {
    /** Update GST percentage. */
    updateGst: (gst_percentage: number) =>
      api.put<GstResponse>("settings/gst/", { gst_percentage }),

    /** Update courier/shipping charge. */
    updateCourier: (courier_charge: number) =>
      api.put<CourierResponse>("settings/courier-charge/", { courier_charge }),

    /** List state/weight-based courier charge slabs. */
    listCourierSlabs: () => api.get<ListResponse<CourierChargeSlab>>("settings/courier-slabs/"),

    /** Create or update (when `id` is set) a courier charge slab. */
    saveCourierSlab: (data: {
      id?: number;
      state?: string;
      minWeight: number;
      maxWeight: number;
      courierCharge: number;
      isDefault?: boolean;
    }) => api.post<DetailResponse<CourierChargeSlab>>("settings/courier-slabs/", data),

    /** Delete a courier charge slab. */
    deleteCourierSlab: (id: number) => api.delete(`settings/courier-slabs/${id}/`),

    /** Get which dashboard sections are currently visible. */
    getDashboardSections: () =>
      api.get<DetailResponse<DashboardSectionVisibility>>("settings/dashboard-sections/"),

    /** Update which dashboard sections are visible. */
    updateDashboardSections: (data: Partial<DashboardSectionVisibility>) =>
      api.put<DetailResponse<DashboardSectionVisibility>>("settings/dashboard-sections/", data),
  },

  // ─── Shared — both admin and customer read these ───────────────

  /** Get current GST percentage. */
  getGst: () => api.get<GstResponse>("settings/gst/"),

  /** Get current courier/shipping charge. */
  getCourier: () => api.get<CourierResponse>("settings/courier-charge/"),

  /** Calculate courier charge for cart items and delivery state (state/weight slabs). */
  calculateCourier: (items: Array<{ product: number; quantity: number }>, state: string) =>
    api.post<DetailResponse<{ courier_charge: number; total_weight: number }>>("courier/calculate/", {
      items,
      state,
    }),
} as const;
