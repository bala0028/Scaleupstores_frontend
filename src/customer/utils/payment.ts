import { orderService } from "@/shared/api/services";
import { toast } from "sonner";
import config from "@/shared/config/clientConfig";

interface PaymentArgs {
  orderPayload: any;
  formData: Record<string, any>;
  cartItems: any[];
  clearCart: () => void;
  navigate: (path: string) => void;
  setProcessing: (v: boolean) => void;
}

export async function handleCodPayment({ orderPayload, cartItems, clearCart, navigate }: PaymentArgs) {
  try {
    const itemsPayload = cartItems.map((item) => ({ product: item.id, quantity: item.qty }));
    const res = await orderService.customer.reserve({
      items: itemsPayload,
      payment_method: "cod",
      order_data: orderPayload,
    } as any);
    const body: any = res.data;
    if (!body.status) {
      toast.error(String(body.message));
      return;
    }
    toast.success("Order placed successfully!");
    clearCart();
    navigate(`/order-confirmation/${body.data.order.id}`);
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Something went wrong!");
  }
}

export async function handleOnlinePayment({
  orderPayload,
  formData,
  cartItems,
  clearCart,
  navigate,
  setProcessing,
}: PaymentArgs) {
  try {
    const itemsPayload = cartItems.map((item) => ({ product: item.id, quantity: item.qty }));
    const reserveRes = await orderService.customer.reserve({
      items: itemsPayload,
      payment_method: "online",
      order_data: orderPayload,
    } as any);
    const reserveBody: any = reserveRes.data;
    if (!reserveBody.status) {
      toast.error(String(reserveBody.message));
      return;
    }

    const rzOrder: any = reserveBody.data.razorpay_order;
    const options = {
      key: config.payment.razorpayKey,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      order_id: rzOrder.id,
      name: config.payment.razorpayName,
      description: config.payment.razorpayDescription,
      handler: async (response: any) => {
        try {
          setProcessing(true);
          const verifyRes = await orderService.customer.verify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_data: orderPayload,
          });
          const verifyBody: any = verifyRes.data;
          toast.success("Payment successful!");
          clearCart();
          navigate(`/order-confirmation/${verifyBody.data.order.id}`);
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Product might be out of stock now.");
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: `${formData.first_name} ${formData.last_name}`,
        contact: formData.contact_number,
      },
      theme: { color: "#2E7D32" },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", () => toast.error("Payment failed"));
    rzp.open();
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Unable to initiate payment");
  }
}
