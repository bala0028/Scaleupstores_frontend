import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "@/shared/api/services";
import { useFeedbackModal } from "@/shared/hooks";
import { roundHalfUp } from "@/shared/utils/customer";
import { LoadingSpinner } from "@/shared/components/customer-ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Order, DetailResponse } from "@/shared/api/services/types";

interface OrderItem {
  product_name: string;
  price: number;
  quantity: number;
  [k: string]: unknown;
}
interface OrderDetails {
  id: number;
  order_number: string;
  orderNumber?: string;
  status: string;
  orderStatus?: string;
  order_status?: string;
  preferred_courier_service?: string;
  preferredCourierService?: string;
  courier_number?: string;
  courierNumber?: string;
  ordered_at: string;
  orderedAt?: string;
  createdAt?: string;
  created_at?: string;
  delivered_at?: string;
  deliveredAt?: string;
  billing_address: string;
  billingAddress?: string;
  shipping_address: string;
  shippingAddress?: string;
  payment_method: string;
  paymentMethod?: string;
  payment_status: string;
  paymentStatus?: string;
  payment?: { razorpay_payment_id: string; razorpay_order_id: string };
  items: OrderItem[];
  tax_percent: number;
  taxPercent?: number;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  shippingCost?: number;
  total_amount: number;
  totalAmount?: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  order_confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-brand/20 text-brand",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-600",
};

const formatStatus = (v?: string) =>
  v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const OrderTracking: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    showModal,
    setShowModal,
    feedbackProduct,
    rating,
    setRating,
    hover,
    setHover,
    comment,
    setComment,
    maxLength,
    openFeedbackModal,
    submitFeedback,
  } = useFeedbackModal(1000);

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      const r = await orderService.pdf(order.id);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([r.data]));
      link.setAttribute("download", `${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  useEffect(() => {
    if (!orderNumber) return;
    (async () => {
      try {
        const r = await orderService.customer.tracking(orderNumber);
        setOrder((r.data as DetailResponse<OrderDetails>).data);
      } catch {
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderNumber]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 text-center">
        <LoadingSpinner />
      </div>
    );
  if (!order)
    return (
      <div className="max-w-7xl mx-auto px-4 py-5 text-center">
        <h5 className="text-brand-action">No order found</h5>
        <Link
          to="/"
          className="inline-flex items-center bg-brand-action text-white rounded-pill px-[18px] py-2 font-semibold no-underline transition-all hover:bg-[rgb(95,142,66)] hover:shadow-[0_0_10px_rgba(112,168,77,0.6)] mt-3"
        >
          Back to Home
        </Link>
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="rounded-card border shadow-card mb-4">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-card">
            <h4 className="mb-0 text-brand-action text-center">Order Tracking</h4>
          </div>
          <div className="p-4">
            <h3 className="text-brand-action">Order Number : {order.order_number}</h3>
            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || "bg-gray-800 text-white"}`}
              >
                {formatStatus(order.status)}
              </span>
            </p>
            <p className="mb-1">
              <strong>Preferred Courier:</strong> {order.preferred_courier_service}
            </p>
            <p className="mb-1">
              <strong>Courier Number:</strong> {order.courier_number}
            </p>
            <p className="mb-1">
              <strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}
            </p>
            {order.delivered_at && (
              <p className="text-brand-action">
                <strong>Delivered At:</strong> {new Date(order.delivered_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-2 g-4">
          {/* Addresses */}
          <div className="w-full md:w-1/2 px-2">
            <div className="rounded-card border shadow-card h-full">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-card">
                <h5 className="mb-0 text-brand-action">Addresses</h5>
              </div>
              <div className="p-4 text-brand-action">
                <p>
                  <strong>Billing Address:</strong>
                  <br />
                  {order.billing_address}
                </p>
                <p>
                  <strong>Shipping Address:</strong>
                  <br />
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>
          {/* Payment */}
          <div className="w-full md:w-1/2 px-2">
            <div className="rounded-card border shadow-card h-full">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-card">
                <h5 className="mb-0 text-brand-action">Payment</h5>
              </div>
              <div className="p-4 text-brand-action">
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${order.payment_status === "success" ? "bg-success text-white" : "bg-destructive text-white"}`}
                  >
                    {order.payment_status}
                  </span>
                </p>
                {order.payment && (
                  <>
                    <p>
                      <strong>Payment ID:</strong> {order.payment.razorpay_payment_id}
                    </p>
                    <p>
                      <strong>Order ID:</strong> {order.payment.razorpay_order_id}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-card border shadow-card mb-4">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-card">
            <h5 className="mb-0 text-brand-action">Items</h5>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full border border-brand-border-light rounded-card">
              <thead className="bg-brand-cream text-brand-action">
                <tr>
                  <th className="border border-brand-border-light align-middle p-2">Product</th>
                  <th className="border border-brand-border-light align-middle p-2">Qty</th>
                  <th className="border border-brand-border-light align-middle p-2">Price</th>
                  <th className="border border-brand-border-light align-middle p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const base = roundHalfUp(
                    (Number(item.price) * 100) / (100 + Number(order.tax_percent))
                  );
                  const total = roundHalfUp(base * Number(item.quantity));
                  return (
                    <tr key={i}>
                      <td className="border border-brand-border-light align-middle p-2 flex flex-col md:flex-row items-center md:items-start text-center md:text-left py-2 md:py-0">
                        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto flex-col md:flex-row md:items-center text-center md:text-left">
                          <span className="font-medium text-brand-action break-words w-full md:w-auto text-center md:text-left">
                            {item.product_name}
                          </span>
                          {order.status === "delivered" && (
                            <Button
                              variant="outline"
                              className="border-[1.5px] border-brand-action text-brand-action font-semibold rounded-pill px-3.5 py-1 text-sm transition-all duration-300 whitespace-nowrap inline-flex items-center gap-1 hover:bg-brand-action hover:text-white hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(112,168,77,0.25)] ml-0 md:ml-2 mt-2 md:mt-0 w-4/5 md:w-auto justify-center"
                              onClick={() => openFeedbackModal(item)}
                            >
                              ⭐ Review
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="border border-brand-border-light align-middle p-2">
                        {item.quantity}
                      </td>
                      <td className="border border-brand-border-light align-middle p-2">
                        ₹{base.toFixed(2)}
                      </td>
                      <td className="border border-brand-border-light align-middle p-2">
                        ₹{total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-card border shadow-card mb-4">
          <div className="px-4 py-3 border-b bg-gray-50 rounded-t-card">
            <h5 className="mb-0 text-brand-action">Order Summary</h5>
          </div>
          <div className="p-4 text-brand-action">
            <ul className="space-y-2">
              <li className="py-2 flex justify-between border-0 px-0 pb-0">
                Subtotal <span>₹{order.subtotal.toLocaleString()}</span>
              </li>
              <li className="py-2 flex justify-between px-0">
                Tax <span>₹{order.tax.toLocaleString()}</span>
              </li>
              <li className="py-2 flex justify-between px-0">
                Shipping <span>₹{order.shipping_cost.toLocaleString()}</span>
              </li>
              <li className="py-2 flex justify-between border-0 px-0 mb-0 font-bold">
                Total <span>₹{order.total_amount.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center flex justify-center gap-3">
          <Link to="/orderhistory">
            <Button
              variant="brand"
              type="button"
              className="rounded-pill px-[18px] py-2 font-semibold"
            >
              Back to Home
            </Button>
          </Link>
          <Button
            variant="brand"
            type="button"
            className="rounded-pill px-[18px] py-2 font-semibold"
            onClick={downloadInvoice}
          >
            Download Invoice
          </Button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white w-[90%] max-w-[450px] rounded-xl animate-[fadeInModal_0.3s_ease] p-4 shadow">
            <h5 className="text-success font-bold mb-3">Feedback for {feedbackProduct?.name}</h5>
            <div className="flex justify-center text-3xl text-gray-300 cursor-pointer mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`${s <= (hover || rating) ? "text-yellow-400 scale-110" : ""} transition-transform duration-200`}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(rating)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] mb-3"
              rows={3}
              placeholder={`Write your feedback (max ${maxLength} characters)`}
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value.slice(0, maxLength))
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                className="px-4 py-2 rounded font-semibold"
                onClick={submitFeedback}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderTracking;
