/**
 * Product Service
 *
 * Admin: full CRUD for products (with image upload) + main product dropdown.
 * Customer: product detail, category browsing, search, offers, stock check.
 */
import api from "../client";
import { MULTIPART } from "./config";
import type {
  Product,
  MainProductItem,
  StockResponse,
  ListResponse,
  DetailResponse,
} from "./types";

export const productService = {
  admin: {
    /** List all products (admin table). */
    list: () => api.get<ListResponse<Product>>("product/"),

    /** Get single product by ID. */
    getById: (id: number | string) => api.get<DetailResponse<Product>>(`product/${id}/`),

    /** Create a new product (multipart — supports image upload). */
    create: (payload: FormData) =>
      api.post<DetailResponse<Product>>("product/", payload, MULTIPART),

    /** Update a product (multipart — supports image upload). */
    update: (id: number | string, payload: FormData) =>
      api.put<DetailResponse<Product>>(`product/${id}/`, payload, MULTIPART),

    /** Delete a product. */
    delete: (id: number | string) => api.delete(`product/${id}/`),

    /** Dropdown list of main (parent) products — used in variant forms. */
    mainProductList: () => api.get<ListResponse<MainProductItem>>("mainproductlist/"),
  },

  customer: {
    /** List all products (customer storefront). */
    list: (page = 1) => api.get<ListResponse<Product>>(`productlist/?page=${page}`),

    /** Get full product detail by ID (customer storefront). */
    detail: (id: number | string) => api.get<DetailResponse<Product>>(`productlist/${id}/`),

    /** Browse products by category with pagination. */
    byCategory: (catId: number | string, page = 1) =>
      api.get<ListResponse<Product>>(`productfilter/${catId}/?page=${page}`),

    /** Search products by keyword. */
    search: (query: string) =>
      api.get<ListResponse<Product>>(`products/search/?search=${encodeURIComponent(query)}`),

    /** List products with active offers. */
    offers: (page = 1) =>
      api.get<ListResponse<Product>>(`productlist/?offer_only=true&page=${page}`),

    /** Check stock availability for a product. */
    stock: (productId: number | string) => api.get<StockResponse>(`stock/?product_id=${productId}`),
  },
} as const;
