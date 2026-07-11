/**
 * Favorite Service
 *
 * Customer: list favorites, check if product is favorited, toggle favorite.
 */
import api from "../client";
import type { FavoriteIdsResponse, FavoriteToggleResponse, ListResponse, Favorite } from "./types";

export const favoriteService = {
  customer: {
    /** List favorited products with pagination. */
    list: (authId: number | string, page = 1) =>
      api.get<ListResponse<Favorite>>("favorites/", {
        params: { auth_id: authId, page },
      }),

    /** Get all favorited product IDs (for heart icon state). */
    ids: (authId: number | string) =>
      api.get<FavoriteIdsResponse>("favorites/ids/", {
        params: { auth_id: authId },
      }),

    /** Check if a specific product is favorited. */
    check: (authId: number | string, productId: number | string) =>
      api.get<FavoriteIdsResponse>("favorites/ids/", {
        params: { auth_id: authId, product_id: productId },
      }),

    /** Toggle favorite on/off for a product. */
    toggle: (authId: number | string, productId: number | string) =>
      api.post<FavoriteToggleResponse>("favorites/toggle/", {
        product_id: productId,
        auth_id: authId,
      }),
  },
} as const;
