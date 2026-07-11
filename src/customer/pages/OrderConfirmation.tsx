import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/shared/api/services";
import { roundHalfUp, formatProductName } from "@/shared/utils/customer";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  [key: string]: unknown;
}
interface OrderData {
  order_number: string;
  first_name: string;
  last_name: string;
  status: string;
  payment_method: string;
  payment_status: string;
  preferred_courier_service: string;
  shipping_address: string;
  billing_address: string;
  ordered_at: string;
  items: OrderItem[];
  tax_percent: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
  [key: string]: unknown;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500 text-black",
  order_confirmed: "bg-blue-500 text-white",
  shipped: "bg-blue-600 text-white",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
  returned: "bg-gray-600 text-white",
};
const formatStatus = (s: string) =>
  s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = `order_confirm_reloaded_${orderId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "true");
      window.location.reload();
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    orderService
      .getById(orderId)
      .then((res) => setOrder(res.data.data as unknown as OrderData))
      .catch((err) => console.error("Failed to fetch order", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 text-center">
        <h4 className="text-brand">Loading order details...</h4>
      </div>
    );
  if (!order)
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 text-center">
        <h4 className="text-brand">Order not found!</h4>
        <Link
          to="/"
          className="bg-brand-action text-white rounded-pill font-semibold px-5 py-2 border-0 transition-colors duration-300 hover:bg-brand cursor-pointer no-underline inline-block mt-3 md:text-lg md:px-5 md:py-3"
        >
          Go to Home
        </Link>
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-wrap justify-center">
          <div className="w-full md:w-5/6">
            <div className="bg-white rounded-lg shadow">
              <div className="bg-brand text-white text-center rounded-t-card p-4">
                <h4>Order Confirmed!</h4>
              </div>
              <div className="p-4">
                <h5 className="mb-3 text-center">
                  Thank you,{" "}
                  <strong>
                    {order.first_name} {order.last_name}
                  </strong>
                </h5>
                <p className="text-center">
                  Your order <strong>#{order.order_number}</strong> has been placed successfully.
                </p>

                <div className="flex flex-wrap mb-4">
                  <div className="w-full md:w-1/2 mb-3 md:mb-0">
                    <p>
                      <strong>Status: </strong>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-800 text-white"}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                    </p>
                    <p>
                      <strong>Payment Status:</strong> {order.payment_status}
                    </p>
                    <p>
                      <strong>Preferred Courier:</strong> {order.preferred_courier_service}
                    </p>
                  </div>
                  <div className="w-full md:w-1/2">
                    <p>
                      <strong>Shipping Address:</strong> {order.shipping_address}
                    </p>
                    <p>
                      <strong>Billing Address:</strong> {order.billing_address}
                    </p>
                    <p>
                      <strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <h5 className="mb-3">Order Items</h5>
                <div className="overflow-x-auto">
                  <table className="w-full border rounded mb-0">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Product</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => {
                        const basePrice = roundHalfUp(
                          (Number(item.price) * 100) / (100 + Number(order.tax_percent))
                        );
                        const totalBase = roundHalfUp(basePrice * Number(item.quantity));
                        return (
                          <tr key={idx}>
                            <td className="border p-2">{formatProductName(item.product_name)}</td>
                            <td className="border p-2">{item.quantity}</td>
                            <td className="border p-2">₹{basePrice.toFixed(2)}</td>
                            <td className="border p-2">₹{totalBase.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-right mt-4">
                  <p>
                    <strong>Subtotal:</strong> ₹{order.subtotal.toLocaleString()}
                  </p>
                  <p>
                    <strong>Tax:</strong> ₹{order.tax.toLocaleString()}
                  </p>
                  <p>
                    <strong>Shipping:</strong> ₹{order.shipping_cost.toLocaleString()}
                  </p>
                  <h5>
                    <strong>Total Amount:</strong> ₹{order.total_amount.toLocaleString()}
                  </h5>
                </div>

                <div className="text-center mt-4">
                  <a
                    href="/"
                    className="bg-brand-action text-white rounded-pill font-semibold px-5 py-2 border-0 transition-colors duration-300 hover:bg-brand cursor-pointer no-underline inline-block md:text-lg md:px-5 md:py-3"
                  >
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
