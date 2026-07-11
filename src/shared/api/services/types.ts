/**
 * Shared API Types
 *
 * All request/response interfaces for the service layer.
 * Organized by domain, matching the service file structure.
 */

// ─── Common ──────────────────────────────────────────────────────

/** Standard paginated response from Django REST Framework. */
export interface PaginatedResponse<T> {
  data: Customer[];
  results: T[];
  count?: number;
  total_count?: number;
  current_page?: number;
  total_pages?: number;
  page_size?: number;
  next?: string | null;
}

/** Standard list response wrapper used by most endpoints. */
export interface ListResponse<T> {
  data: T[];
  status?: boolean;
  message?: string;
  total_items?: number;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
}

/** Standard detail response wrapper. */
export interface DetailResponse<T> {
  data: T;
  status?: boolean;
  message?: string;
}

/** Generic message response. */
export interface MessageResponse {
  message?: string;
  status?: boolean;
}

// ─── Auth ────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload for a step-1 request that only sends a single identifier (no password). */
export interface EmailOnlyPayload {
  email: string;
}

/** Payload for step-2 of email registration (carries the new password). */
export interface EmailRegisterStep2Payload {
  session_id: string;
  otp: string;
  password: string;
}

export interface OtpPayload {
  session_id: string;
  otp: string;
}

export interface PhonePayload {
  phone: string;
}

export interface GooglePayload {
  token: string;
}

export interface SetPasswordPayload {
  uid: string;
  token: string;
  password: string;
}

export type AdminLoginResponse =
  | {
      session_id?: string;
      message?: string;
    }
  | TokenResponse;

export interface TokenResponse {
  access: string;
  refresh: string;
  admin?: Record<string, unknown>;
  user?: Record<string, unknown>;
}

export interface OtpStepResponse {
  session_id: string;
  message?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────

export interface DashboardSummary {
  total_customers: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  recent_orders: Array<{
    id: number;
    orderNumber?: string;
    order_number?: string;
    totalAmount?: number;
    total_amount?: number;
    orderStatus?: string;
    order_status?: string;
    createdAt?: string;
    created_at?: string;
    customer?: { id: number; fullName?: string; full_name?: string; email?: string };
  }>;
  orders_by_status: Record<string, number>;
  low_stock_products: Array<{ id: number; productName: string; product_name?: string; stockQuantity: number; stock_quantity?: number; image?: string }>;
  today_orders: number;
  yesterday_orders: number;
  avg_order_value: number;
  pending_orders: number;
  low_stock_count: number;
  new_customers_this_week: number;
  new_customers_last_week: number;
  revenue_today: number;
  revenue_yesterday: number;
  revenue_change_pct: number;
}

export interface SalesChartData {
  chartData: Array<{ date: string; sales: number }>;
  peakDay: { date: string; sales: number };
}

export interface OrdersByStatusItem {
  status: string;
  count: number;
}

export interface TopProductItem {
  product_id: number;
  product_name: string;
  image?: string;
  price: number;
  total_sold: number;
  total_revenue: number;
}

export interface CustomerGrowthItem {
  month: string;
  new_customers: number;
  cumulative_customers: number;
}

export interface CategoryRevenueItem {
  category: string;
  revenue: number;
}

export interface HourlySalesItem {
  hour: number;
  orders: number;
  revenue: number;
}

export interface DayOfWeekSalesItem {
  day: string;
  dayIndex: number;
  orders: number;
  revenue: number;
}

export interface TopCustomerItem {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
}

export interface LowStockAlertItem {
  id: number;
  product_name: string;
  stock_quantity: number;
  image?: string;
  price: number;
  is_critical: boolean;
}

export interface AttentionItems {
  pending_orders_overdue: number;
  failed_payments: number;
  cod_pending_confirmation: number;
  unprinted_labels: number;
  unapproved_reviews: number;
}

export interface OperationsInsights {
  payment: {
    cod_count: number;
    cod_revenue: number;
    online_count: number;
    online_revenue: number;
    payment_failure_rate: number;
    avg_delivery_days: number;
  };
  logistics: {
    by_state: Array<{ state: string; orders: number; revenue: number }>;
    total_shipping_cost: number;
    total_revenue: number;
    shipping_cost_ratio_pct: number;
  };
  repeat_customers: {
    total_customers_with_orders: number;
    repeat_customers: number;
    repeat_rate_pct: number;
  };
}

export interface CatalogInsights {
  inventory: {
    out_of_stock_count: number;
    dead_stock_count: number;
    dead_stock_products: Array<{ id: number; product_name: string; stock_quantity: number; price: number }>;
  };
  category_performance: Array<{
    category: string;
    revenue: number;
    units_sold: number;
    avg_rating: number | null;
  }>;
}

export interface EngagementInsights {
  reviews: {
    avg_rating: number;
    total_reviews: number;
    rating_distribution: Record<string, number>;
    pending_approval_count: number;
  };
  offers: {
    active_offers: Array<{
      id: number;
      offer_name: string;
      category: string | null;
      product: string | null;
      offer_percentage: number | null;
      start_date: string;
      end_date: string;
    }>;
    revenue_from_offered_products: number;
    offered_products_count: number;
  };
}

export interface DashboardData {
  totalOrders?: number;
  total_orders?: number;
  totalCustomers?: number;
  total_customers?: number;
  totalProducts?: number;
  total_products?: number;
  totalRevenue?: number;
  total_revenue?: number;
  stats?: {
    total_sales?: number;
    total_products?: number;
    total_orders?: number;
    total_customers?: number;
  };
  sales_chart?: Array<{ date: string; sales: number }>;
  top_products?: Array<{ name: string; amount: string; product_name?: string; total_sold?: number }>;
  recent_orders?: Array<{
    id: number;
    order_number?: string;
    customer_name?: string;
    order_status?: string;
    total_amount?: number;
    created_at?: string;
  }>;
  orders_by_status?: Record<string, number>;
  low_stock_products?: Array<{ id: number; productName: string; stockQuantity: number; image: string }>;
  today_orders?: number;
  [key: string]: unknown;
}

// ─── Admin Users ─────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  isAdmin?: boolean;
  is_admin?: boolean;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface AdminCreatePayload {
  email: string;
  full_name: string;
  phone: string;
  role: string;
  [key: string]: unknown;
}

// ─── Categories ──────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  categoryName?: string;
  category_name?: string;
  categoryImage?: string;
  category_image?: string;
  image?: string;
  createdByName?: string;
  created_by_name?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  description?: string;
  products?: Product[];
  [key: string]: unknown;
}

// ─── Products ────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  categoryId?: number;
  category?: number | Category;
  categoryName?: string;
  category_name?: string;
  price?: number;
  averageRating?: number;
  average_rating?: number;
  createdByName?: string;
  created_by_name?: string;
  productDescription?: string;
  product_description?: string;
  productImage?: string;
  product_image?: string;
  productName?: string;
  product_name?: string;
  quantity?: number;
  quantityUnit?: string;
  quantity_unit?: string;
  stockQuantity?: number;
  stock_quantity?: number;
  availableStock?: number;
  available_stock?: number;
  offerPercentage?: number;
  offer_percentage?: number;
  isActive?: boolean;
  is_active?: boolean;
  isAvailable?: boolean;
  is_available?: boolean;
  categoryObj?: Category;
  image?: string;
  offers?: Offer[];
  variants?: Variant[];
  [key: string]: unknown;
}

export interface MainProductItem {
  id: number;
  name: string;
  productName?: string;
  product_name?: string;
  [key: string]: unknown;
}

export interface StockResponse {
  inStock?: boolean;
  in_stock?: boolean;
  quantity?: number;
  stock?: number;
  stockQuantity?: number;
  stock_quantity?: number;
  [key: string]: unknown;
}

// ─── Variants ────────────────────────────────────────────────────

export interface Variant {
  id: number;
  parentId?: number;
  parent?: number | Product;
  averageRating?: number;
  average_rating?: number;
  categoryName?: string;
  category_name?: string;
  parentName?: string;
  parent_name?: string;
  price?: number;
  productDescription?: string;
  product_description?: string;
  productImage?: string;
  product_image?: string;
  productName?: string;
  product_name?: string;
  quantity?: number;
  quantityUnit?: string;
  quantity_unit?: string;
  stockQuantity?: number;
  stock_quantity?: number;
  isActive?: boolean;
  is_active?: boolean;
  image?: string;
  parentProduct?: Product;
  parentObj?: Product;
  [key: string]: unknown;
}

/**
 * Backend returns variants in multiple shapes:
 * - `productvariant/` → `{ results: { data: [...] }, count }`
 * - `productvariantfilter/` → `{ data: { data: [...] } }` or `{ data: [...] }`
 */
export interface VariantListResponse {
  results?: { data: Variant[] };
  data?: { data?: Variant[]; [key: string]: unknown } | Variant[];
  count?: number;
}

// ─── Offers ──────────────────────────────────────────────────────

export interface Offer {
  id: number;
  categoryId?: number;
  category_id?: number;
  productId?: number;
  product_id?: number;
  discountPercentage?: number;
  discount_percentage?: number;
  categoryName?: string;
  category_name?: string;
  createdAt?: string;
  created_at?: string;
  endDate?: string;
  end_date?: string;
  isActive?: boolean;
  is_active?: boolean;
  offerImage?: string;
  offer_image?: string;
  offerName?: string;
  offer_name?: string;
  offerPercentage?: number;
  offer_percentage?: number;
  productName?: string;
  product_name?: string;
  startDate?: string;
  start_date?: string;
  category?: Category;
  product?: Product;
  [key: string]: unknown;
}

export interface OfferPayload {
  categoryId: number | null;
  productId: number;
  offerName: string;
  offerPercentage: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  [key: string]: unknown;
}

// ─── Orders ──────────────────────────────────────────────────────

export interface Order {
  id: number;
  createdAt?: string;
  created_at?: string;
  customerName?: string;
  customer_name?: string;
  orderNumber?: string;
  order_number?: string;
  orderStatus?: string;
  order_status?: string;
  totalAmount?: number;
  total_amount?: number;
  paymentStatus?: string;
  payment_status?: string;
  paymentMethod?: string;
  payment_method?: string;
  isPrinted?: boolean;
  is_printed?: boolean;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  contactNumber?: string;
  contact_number?: string;
  secondaryNumber?: string;
  secondary_number?: string;
  preferredCourierService?: string;
  preferred_courier_service?: string;
  courierNumber?: string;
  courier_number?: string;
  shippingAddress?: string;
  shipping_address?: string;
  billingAddress?: string;
  billing_address?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  shipping_cost?: number;
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  razorpayPaymentId?: string;
  razorpay_payment_id?: string;
  customer?: {
    id: number;
    fullName?: string;
    full_name?: string;
    email?: string;
  };
  items?: Array<{
    id: number;
    quantity: number;
    price: number;
    tax: number;
    total: number;
    product?: Product;
  }>;
  [key: string]: unknown;
}

export interface OrderListData {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

export interface UnprintedParams {
  from_date?: string;
  to_date?: string;
}

export interface OrderStatusPayload {
  order_status: string;
  courier_number?: string;
  [key: string]: unknown;
}

export interface CodPayload {
  order_data: Record<string, unknown>;
}

export interface ReservePayload {
  order_data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  [key: string]: unknown;
}

export interface CodOrderResponse {
  order: { id: number; [key: string]: unknown };
  message?: string;
}

export interface ReserveResponse {
  razorpay_order_id: string;
  [key: string]: unknown;
}

// ─── Customers ───────────────────────────────────────────────────

export interface Customer {
  id: number;
  email?: string;
  phone?: string | null;
  password?: string;
  fullName?: string | null;
  full_name?: string | null;
  address?: string | null;
  dob?: string | null;
  gender?: string | null;
  googleId?: string | null;
  google_id?: string | null;
  loginMethod?: string | null;
  isActive?: boolean;
  is_active?: boolean;
  profileImage?: string | null;
  profile_image?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ─── Contacts ────────────────────────────────────────────────────

export interface Contact {
  id: number;
  name?: string;
  email?: string;
  message?: string;
  phone?: string;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  [key: string]: unknown;
}

// ─── Reviews ─────────────────────────────────────────────────────

export interface Review {
  id: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
  created_at?: string;
  isApproved?: boolean;
  is_approved?: boolean;
  productName?: string;
  product_name?: string;
  userName?: string;
  user_name?: string;
  customerName?: string;
  customer_name?: string;
  productId?: number;
  product_id?: number;
  customerId?: number;
  customer_id?: number;
  [key: string]: unknown;
}

export interface RatingSummary {
  averageRating?: number;
  average_rating?: number;
  totalReviews?: number;
  total_reviews?: number;
  [key: string]: unknown;
}

export interface ReviewPayload {
  rating: number;
  comment?: string;
  [key: string]: unknown;
}

export interface AdminReviewParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  product_id?: string;
  rating?: string;
  ordering?: string;
}

// ─── Favorites ───────────────────────────────────────────────────

export interface Favorite {
  id: number;
  productId?: number;
  product_id?: number;
  product?: Product;
  [key: string]: unknown;
}

export interface FavoriteIdsResponse {
  favorites: number[];
}

export interface FavoriteToggleResponse {
  isFavorite?: boolean;
  is_favorite?: boolean;
  favorite?: boolean;
}

// ─── Notifications ───────────────────────────────────────────────

export interface Notification {
  id: number;
  title?: string;
  message?: string;
  isRead?: boolean;
  is_read?: boolean;
  type?: string;
  customerId?: number;
  customer_id?: number;
  adminId?: number;
  admin_id?: number;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
}

// ─── Settings ────────────────────────────────────────────────────

export interface GstResponse {
  data: any;
  gstPercentage?: number;
  gst_percentage?: number;
}

export interface CourierResponse {
  data: any;
  courierCharge?: number;
  courier_charge?: number;
}

export interface CourierChargeSlab {
  id: number;
  state: string | null;
  minWeight: number;
  maxWeight: number;
  courierCharge: number;
  isDefault: boolean;
}

export interface DashboardSectionVisibility {
  needsAttention: boolean;
  sales: boolean;
  fulfillment: boolean;
  inventory: boolean;
  customers: boolean;
}

// ─── Checkout ────────────────────────────────────────────────────

export interface CartItem {
  id: number | string;
  qty: number;
  [key: string]: unknown;
}

export interface CheckoutInitiatePayload {
  user_id: number | string;
  cart: CartItem[];
}

export interface CheckoutInitiateResponse {
  status: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface CheckoutValidateResponse {
  status: boolean;
  valid_items: Array<{ id: number; qty: number }>;
  [key: string]: unknown;
}

// ─── Shared Params ───────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  page_size?: number;
}
