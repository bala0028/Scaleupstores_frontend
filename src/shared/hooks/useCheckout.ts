import { useNavigate } from "react-router-dom";
import { checkoutService } from "@/shared/api/services";
import { useAuth, useCart } from "@/shared/stores";
import { toast } from "sonner";

interface CheckoutOptions {
  /** If true, stop navigation when backend adjusts cart (Cart page behavior) */
  stopOnAdjustment?: boolean;
}

export const useCheckout = ({ stopOnAdjustment = false }: CheckoutOptions = {}) => {
  const navigate = useNavigate();
  const user = useAuth().user;
  const { items, setCart } = useCart();

  const initiateCheckout = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      localStorage.setItem("redirect_toast", "Please login first to continue checkout");
      navigate("/login");
      return;
    }

    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    const cartPayload = items.map((item: any) => ({
      product_id: item.id,
      qty: item.qty,
    })) as any;

    try {
      const res = await checkoutService.customer.initiate({
        user_id: (user as any)?.id,
        cart: cartPayload,
      });

      const data = res.data as any;

      if (!data?.status) {
        toast.error(data?.message || "Checkout failed");
        return;
      }

      // If there are specific adjustment logic you want to handle from out_of_stock errors,
      // it would be caught in the catch block. For successful validation, just proceed.
      navigate("/checkout");
    } catch (error) {
      console.error("initiateCheckout error:", error);
      toast.error("Unable to start checkout. Please try again.");
    }
  };

  return { initiateCheckout };
};
