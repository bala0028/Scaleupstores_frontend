import { calcOrderTotals, getEffectivePrice, getImageUrl } from "@/shared/utils";
import { CartItem } from "@/shared/stores";

interface OrderSummaryProps {
  items: CartItem[];
  gstPercent: number;
  shippingCost: number;
  action?: React.ReactNode;
}

export function OrderSummary({ items, gstPercent, shippingCost, action }: OrderSummaryProps) {
  const { baseAmount, gstAmount, totalAmount } = calcOrderTotals(items, gstPercent, shippingCost);
  const totalQty = items.reduce((a, i) => a + i.qty, 0);

  return (
    <div className="bg-white rounded-xl border border-brand-border-light shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-brand-cream px-5 py-4 border-b border-brand-border-light">
        <h5 className="font-semibold text-brand-action text-base m-0">Order Summary</h5>
        <p className="text-xs text-gray-500 mt-0.5 m-0">
          {totalQty} item{totalQty !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Cart Items */}
      <div className="px-5 py-3 max-h-52 overflow-y-auto divide-y divide-brand-border-light">
        {items.map((item) => {
          const { current } = getEffectivePrice(item);
          return (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              {item.product_image ? (
                <img
                  src={getImageUrl(item.product_image)}
                  alt={item.product_name || "Product"}
                  className="w-10 h-10 rounded-lg object-cover border border-brand-border-light shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-cream border border-brand-border-light flex items-center justify-center shrink-0 text-brand-action text-sm">
                  🛒
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate m-0">
                  {item.product_name || "Product"}
                </p>
                {item.variant_label && (
                  <p className="text-xs text-gray-400 m-0">{String(item.variant_label)}</p>
                )}
                <p className="text-xs text-gray-500 m-0">Qty: {item.qty}</p>
              </div>
              <span className="text-xs font-semibold text-brand-action shrink-0">
                ₹{(current * item.qty).toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t border-brand-border-light space-y-2">
        <Row label="Base Amount" value={baseAmount} />
        <Row label={`GST (${gstPercent}%)`} value={gstAmount} />
        <Row label="Shipping" value={shippingCost} />
        <div className="border-t border-brand-border-light pt-3 mt-1 flex justify-between items-center">
          <span className="font-bold text-gray-800 text-sm">Total</span>
          <span className="font-bold text-brand-action text-lg">
            ₹{totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {action && <div className="px-5 pb-4">{action}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700 font-medium">₹{value.toLocaleString()}</span>
    </div>
  );
}
