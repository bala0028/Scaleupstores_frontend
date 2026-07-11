import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { orderService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";
import type { OrderStatusPayload } from "@/shared/api/services/types";

interface OrderData {
  order_number: string;
  customer_name: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  status: string;
  courier_number?: string;
}

const STATUS_OPTIONS = [
  { value: "order_confirmed", label: "Order Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const STATUS_FLOW = ["order_confirmed", "shipped", "delivered"];

export default function OrderUpdate({ entityId, open, handleOpenClose, refresh }: DialogPageProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courierNumber, setCourierNumber] = useState("");

  useEffect(() => {
    if (!open || !entityId) return;
    setLoading(true);
    setError(null);
    orderService
      .getById(entityId)
      .then((res) => {
        const data = res.data.data as unknown as OrderData;
        setOrder(data);
        setCourierNumber(data.courier_number || "");
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setLoading(false));
  }, [open, entityId]);

  const isOptionDisabled = (value: string): boolean => {
    if (!order) return true;
    const cur = STATUS_FLOW.indexOf(order.status);
    const opt = STATUS_FLOW.indexOf(value);
    return opt < cur || opt > cur + 1;
  };

  const onSubmit = async () => {
    if (!order) return;
    if (order.status === "shipped" && !courierNumber.trim()) {
      toast.error("Courier number is required when status is Shipped");
      return;
    }

    setUpdating(true);
    try {
      const payload: OrderStatusPayload = { order_status: order.status };
      if (order.status === "shipped") payload.courier_number = courierNumber;

      await orderService.admin.updateStatus(entityId!, payload);
      toast.success("Order status updated successfully");
      refresh?.();
      handleOpenClose(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Update Order Status"
      onSubmit={onSubmit}
      submitLabel={updating ? "Updating..." : "Update Status"}
      loading={updating || loading}
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6 text-destructive">{error}</div>
      ) : order ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Order Number:</strong> {order.order_number}
            </div>
            <div>
              <strong>Customer:</strong> {order.customer_name}
            </div>
            <div>
              <strong>Payment Method:</strong> {order.payment_method}
            </div>
            <div>
              <strong>Payment Status:</strong> {order.payment_status}
            </div>
            <div>
              <strong>Total:</strong> ₹{order.total_amount}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <div className="w-64 space-y-1.5">
              <Label>Order Status</Label>
              <Select
                value={order.status}
                onValueChange={(v) => {
                  setOrder({ ...order, status: v });
                  if (v !== "shipped") setCourierNumber("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} disabled={isOptionDisabled(s.value)}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {order.status === "shipped" && (
            <div className="flex justify-center mt-4">
              <div className="w-64 space-y-1.5">
                <Label htmlFor="courier">Courier Number</Label>
                <Input
                  id="courier"
                  value={courierNumber}
                  onChange={(e) => setCourierNumber(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </FormDialog>
  );
}
