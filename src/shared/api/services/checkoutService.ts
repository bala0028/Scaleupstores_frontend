/**
 * Checkout Service
 *
 * Customer: initiate checkout (validate cart + lock stock) and
 * validate cart items before payment.
 */
import api from "../client";
import type {
  CheckoutInitiatePayload,
  CheckoutInitiateResponse,
  CheckoutValidateResponse,
} from "./types";

export const checkoutService = {
  customer: {
    /** Initiate checkout — validates cart and locks stock. */
    initiate: (payload: CheckoutInitiatePayload) =>
      api.post<CheckoutInitiateResponse>("checkout-initiate/", payload),

    /** Validate cart items are still in stock before payment. */
    validate: (userId: number | string) =>
      api.post<CheckoutValidateResponse>("checkout-validate/", { user_id: userId }),
  },
} as const;
