/**
 * Order Service
 *
 * Admin: list, search, status update, unprinted orders, print address labels.
 * Customer: COD/online order creation, tracking, order history.
 * Shared: order detail, PDF download.
 */
import type { AxiosRequestConfig } from "axios";
import api from "../client";
import type {
  Order,
  OrderListData,
  UnprintedParams,
  OrderStatusPayload,
  CodPayload,
  ReservePayload,
  VerifyPayload,
  CodOrderResponse,
  ReserveResponse,
  PaginatedResponse,
  DetailResponse,
} from "./types";

export const orderService = {
  admin: {
    /** List orders with pagination. */
    list: (params: { page: number; page_size: number }) =>
      api.get<DetailResponse<OrderListData>>("orderdetails/", { params }),

    /** Search orders by keyword (order number, customer name, etc). Returns all matches, unpaginated. */
    search: (query: string) =>
      api.get<DetailResponse<OrderListData>>("orderdetails/", { params: { search: query } }),

    /** Update order status (e.g. processing → shipped). */
    updateStatus: (id: number | string, payload: OrderStatusPayload) =>
      api.put(`order-status/${id}/`, payload),

    /** List orders that haven't been printed yet (for address labels). */
    unprinted: (params?: UnprintedParams) => api.get("orders/unprinted/", { params }),

    /** Generate PDF with address labels for selected orders. Returns blob. */
    printAddress: (orderIds: number[]) =>
      api.post("orders/print-address/", { order_ids: orderIds }, {
        responseType: "blob",
      } as AxiosRequestConfig),

    /** Generate PDF address label for a single order. Returns blob. */
    printSingle: (orderId: number) =>
      api.post("single-orders/print-address/", { order_id: orderId }, {
        responseType: "blob",
      } as AxiosRequestConfig),
  },

  customer: {
    /** Place a Cash on Delivery order. */
    createCod: (payload: CodPayload) => api.post<CodOrderResponse>("orders/create-cod/", payload),

    /** Reserve an online payment order (creates Razorpay order). */
    reserve: (payload: ReservePayload) => api.post<ReserveResponse>("orders/reserve/", payload),

    /** Verify Razorpay payment after successful online payment. */
    verify: (payload: VerifyPayload) => api.post("orders/verify/", payload),

    /** Track an order by order number. */
    tracking: (orderNumber: string) => api.get(`order-tracking/${orderNumber}/`),

    /** Get paginated order history for a customer. */
    history: (userId: number | string, page = 1) =>
      api.get<PaginatedResponse<Order>>(`orders-history/${userId}/?page=${page}`),
  },

  // ─── Shared — used by both admin and customer ──────────────────

  /** Get full order detail by ID. */
  getById: (id: number | string) => api.get<DetailResponse<Order>>(`orderdetails/${id}/`),

  /** Download order invoice PDF. Returns blob. */
  pdf: (id: number | string) => api.get(`orderspdf/${id}/`, { responseType: "blob" }),
} as const;
