import type { DialogPageProps } from "@/admin/types";
import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/admin/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { orderService } from "@/shared/api/services";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500 text-white",
  order_confirmed: "bg-blue-500 text-white",
  shipped: "bg-blue-500 text-white",
  delivered: "bg-green-500 text-white",
  cancelled: "bg-destructive/100 text-white",
  returned: "bg-yellow-500 text-white",
  success: "bg-green-500 text-white",
  failed: "bg-destructive/100 text-white",
  refunded: "bg-blue-500 text-white",
};

const formatStatus = (status: string) =>
  status
    ? status
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

export default function ViewOrder({ entityId, open, handleOpenClose }: DialogPageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await orderService.getById(entityId!);
      setOrder(res.data.data);
    } catch {
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const res = await orderService.pdf(order.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const totalTax = useMemo(() => (order ? parseFloat(order.tax) : 0), [order]);
  const shippingCharge = useMemo(() => (order ? parseFloat(order.shippingCost) : 0), [order]);
  const totalAmount = useMemo(() => (order ? parseFloat(order.totalAmount) : 0), [order]);
  const customerName = useMemo(() => {
    if (!order) return "";
    const guestName = [order.firstName, order.lastName].filter(Boolean).join(" ");
    return guestName || order.customer?.fullName || order.customer?.email || "—";
  }, [order]);

  useEffect(() => {
    if (open && entityId) fetchOrder();
  }, [open, entityId]);

  return (
    <Dialog open={open} onOpenChange={handleOpenClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="sticky top-0 bg-white z-10 border-b px-6 py-4">
          <DialogTitle className="text-center">View Order</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-6 gap-2">
              <Skeleton className="h-6 w-6 rounded-full" /> Loading...
            </div>
          ) : error ? (
            <div className="text-center py-6 text-destructive">{error}</div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Order Number:</strong> {order.orderNumber}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Order Status:</strong>
                  <Badge className={STATUS_COLORS[order.orderStatus] || "bg-muted0 text-white"}>
                    {formatStatus(order.orderStatus)}
                  </Badge>
                </div>
                <div>
                  <strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Payment Status:</strong>
                  <Badge className={STATUS_COLORS[order.paymentStatus] || "bg-muted0 text-white"}>
                    {formatStatus(order.paymentStatus)}
                  </Badge>
                </div>
                <div>
                  <strong>Customer Name:</strong> {customerName}
                </div>
                <div>
                  <strong>Ordered At:</strong> {new Date(order.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Preferred Courier:</strong> {order.preferredCourierService || "—"}
                </div>
                <div>
                  <strong>Courier Number:</strong> {order.courierNumber || "—"}
                </div>
                <div>
                  <strong>Delivered At:</strong>{" "}
                  {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "-"}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Shipping Address:</strong>
                  <div className="border bg-muted rounded-lg p-2 mt-1 text-sm text-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {order.shippingAddress || "—"}
                  </div>
                </div>
                <div>
                  <strong>Billing Address:</strong>
                  <div className="border bg-muted rounded-lg p-2 mt-1 text-sm text-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {order.billingAddress || "—"}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-md table-fixed">
                  <thead className="bg-muted">
                    <tr>
                      <th className="w-1/2 px-4 py-2 border text-left">Product Name</th>
                      <th className="w-1/6 px-4 py-2 border text-center">Quantity</th>
                      <th className="w-1/6 px-4 py-2 border text-center">Price</th>
                      <th className="w-1/6 px-4 py-2 border text-center">Sub Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item: any) => {
                      const roundHalfUp = (value: number, decimals = 2) => {
                        const factor = Math.pow(10, decimals);
                        return Math.round(value * factor) / factor;
                      };
                      const priceInclGST = Number(item.price);
                      const gstPercent =
                        order.subtotal > 0 ? (Number(order.tax) / Number(order.subtotal)) * 100 : 0;
                      const qty = Number(item.quantity);
                      const basePrice = roundHalfUp((priceInclGST * 100) / (100 + gstPercent), 2);
                      const baseTotal = roundHalfUp(basePrice * qty, 2);
                      const productName = item.product?.productName ?? "";

                      return (
                        <tr key={item.id} className="hover:bg-muted">
                          <td className="px-4 py-2 border">
                            {productName
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </td>
                          <td className="px-4 py-2 border text-center">{qty}</td>
                          <td className="px-4 py-2 border text-center">₹{basePrice.toFixed(2)}</td>
                          <td className="px-4 py-2 border text-center">₹{baseTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted">
                    <tr>
                      <th colSpan={3} className="px-4 py-2 text-right border">
                        Subtotal:
                      </th>
                      <th className="px-4 py-2 border text-center">
                        ₹{Number(order.subtotal).toFixed(2)}
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-2 text-right border">
                        Tax:
                      </th>
                      <th className="px-4 py-2 border text-center">₹{totalTax.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-2 text-right border">
                        Shipping:
                      </th>
                      <th className="px-4 py-2 border text-center">₹{shippingCharge.toFixed(2)}</th>
                    </tr>
                    <tr>
                      <th colSpan={3} className="px-4 py-2 text-right border">
                        <strong>Total Amount:</strong>
                      </th>
                      <th className="px-4 py-2 border text-center text-success font-semibold">
                        ₹{totalAmount.toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-6 sticky bottom-0 bg-white py-2">
                <Button variant="outline" onClick={() => handleOpenClose(false)}>
                  Close
                </Button>
                <Button onClick={downloadInvoice} disabled={downloading}>
                  {downloading ? "Downloading..." : "Download Invoice"}
                </Button>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
