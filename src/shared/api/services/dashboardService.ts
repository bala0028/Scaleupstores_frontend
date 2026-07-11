/**
 * Dashboard Service
 *
 * Admin dashboard summary data and charts.
 */
import api from "../client";
import type { DetailResponse, ListResponse } from "./types";
import type {
  DashboardSummary,
  SalesChartData,
  OrdersByStatusItem,
  TopProductItem,
  CustomerGrowthItem,
  CategoryRevenueItem,
  HourlySalesItem,
  DayOfWeekSalesItem,
  TopCustomerItem,
  LowStockAlertItem,
  AttentionItems,
  OperationsInsights,
  CatalogInsights,
  EngagementInsights,
} from "./types";

export const dashboardService = {
  admin: {
    /** Fetch dashboard summary stats. */
    getSummary: () => api.get<DetailResponse<DashboardSummary>>("dashboard/summary"),

    /** Fetch sales/revenue chart data. */
    getSalesChart: (days: number = 30) =>
      api.get<DetailResponse<SalesChartData>>(`dashboard/sales-chart?days=${days}`),

    /** Fetch orders by status. */
    getOrdersByStatus: () => api.get<ListResponse<OrdersByStatusItem>>("dashboard/orders-by-status"),

    /** Fetch top selling products. */
    getTopProducts: (limit: number = 10) =>
      api.get<ListResponse<TopProductItem>>(`dashboard/top-products?limit=${limit}`),

    /** Fetch customer growth data. */
    getCustomerGrowth: (months: number = 12) =>
      api.get<ListResponse<CustomerGrowthItem>>(`dashboard/customer-growth?months=${months}`),

    /** Fetch category-wise revenue. */
    getCategoryRevenue: () => api.get<ListResponse<CategoryRevenueItem>>("dashboard/category-revenue"),

    /** Fetch hourly sales data (today). */
    getHourlySales: () => api.get<ListResponse<HourlySalesItem>>("dashboard/hourly-sales"),

    /** Fetch day-of-week sales data. */
    getDayOfWeekSales: () => api.get<ListResponse<DayOfWeekSalesItem>>("dashboard/day-of-week-sales"),

    /** Fetch top customers by spend. */
    getTopCustomers: (limit: number = 10) =>
      api.get<ListResponse<TopCustomerItem>>(`dashboard/top-customers?limit=${limit}`),

    /** Fetch low stock alerts. */
    getLowStockAlerts: (threshold: number = 5) =>
      api.get<ListResponse<LowStockAlertItem>>(`dashboard/low-stock-alerts?threshold=${threshold}`),

    /** Fetch needs-attention counts (overdue orders, failed payments, unprinted labels, etc). */
    getAttentionItems: () => api.get<DetailResponse<AttentionItems>>("dashboard/attention"),

    /** Fetch payment split, logistics (orders by state, shipping ratio), repeat customer rate. */
    getOperationsInsights: (days: number = 30) =>
      api.get<DetailResponse<OperationsInsights>>(`dashboard/operations-insights?days=${days}`),

    /** Fetch inventory health (out-of-stock, dead stock) and category performance. */
    getCatalogInsights: (days: number = 30) =>
      api.get<DetailResponse<CatalogInsights>>(`dashboard/catalog-insights?days=${days}`),

    /** Fetch review rating distribution and active offer performance. */
    getEngagementInsights: (days: number = 30) =>
      api.get<DetailResponse<EngagementInsights>>(`dashboard/engagement-insights?days=${days}`),
  },
} as const;