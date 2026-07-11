import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { orderService } from "@/shared/api/services";
import { formatProductName, getImageUrl } from "@/shared/utils/customer";
import { Button } from "@/components/ui/button";

interface OrderItem {
  product_image?: string;
  product_name?: string;
  [key: string]: unknown;
}
interface OrderData {
  order_number: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
  [key: string]: unknown;
}
interface OrderHistoryResponse {
  results: OrderData[];
  count: number;
  [key: string]: unknown;
}
interface User {
  customer_details: { id: number };
  [key: string]: unknown;
}

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-500 text-black",
  order_confirmed: "bg-blue-500 text-black",
  shipped: "bg-blue-600",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
  returned: "bg-gray-600",
};

const formatStatus = (s: string) =>
  s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const OrderHistory = () => {
  const user = useAuth().user as any as User | null;
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(
    async (pageNo = 1) => {
      if (!user?.customer_details?.id) return;
      setLoading(true);
      try {
        const res = await orderService.customer.history(user.customer_details.id, pageNo);
        const data = res.data as unknown as OrderHistoryResponse;
        setOrders(data.results || []);
        setPage(pageNo);
        setTotalPages(Math.ceil(data.count / 16));
      } catch (e) {
        console.error("Error fetching order history:", e);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 my-3 py-3">
        <h2 className="text-4xl text-center">My Order History</h2>
        <hr />
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3 shadow-sm rounded animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {orders.map((order, idx) => {
                const firstItem = order.items?.[0];
                return (
                  <div key={idx} className="bg-white shadow-sm text-center p-3 rounded">
                    <div className="w-full h-[130px] flex items-center justify-center bg-white rounded-lg overflow-hidden mb-3">
                      <img
                        src={getImageUrl(firstItem?.product_image) || "/no-image.png"}
                        alt={firstItem?.product_name || "Product"}
                        className="max-h-full w-auto object-contain"
                      />
                    </div>
                    <h6 className="mb-1 font-bold">
                      {firstItem?.product_name
                        ? formatProductName(firstItem.product_name)
                        : "Products included"}
                    </h6>
                    <p className="text-sm mb-1">
                      <strong>Status:</strong>{" "}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[order.status] || "bg-gray-600"}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </p>
                    <p className="text-sm mb-2">Order #{order.order_number}</p>
                    <p className="font-bold mb-3">₹{order.total_amount.toLocaleString()}</p>
                    <Link to={`/order-tracking/${order.order_number}`}>
                      <Button
                        variant="brand"
                        className="w-full md:text-lg md:px-5 md:py-3"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-5">
              <Button
                variant="brand"
                className="mx-1"
                disabled={page === 1}
                onClick={() => fetchOrders(page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="brand"
                className="mx-1"
                disabled={page === totalPages}
                onClick={() => fetchOrders(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default OrderHistory;
