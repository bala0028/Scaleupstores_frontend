import { useEffect, useState } from "react";
import { settingsService, productService } from "@/shared/api/services";
import { useCheckout, useStockCheck } from "@/shared/hooks";
import { motion } from "framer-motion";
import { useCart, CartItem } from "@/shared/stores";
import { EmptyState } from "@/shared/components/customer-ui";
import { formatProductName, getEffectivePrice, calcOrderTotals, getImageUrl } from "@/shared/utils";
import { Minus, Trash2, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const [GST, setGST] = useState(0);
  const [stocks, setStocks] = useState<Record<number, number>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { stockError, disabledQty, checkStock, clearStockError } = useStockCheck();
  const { initiateCheckout } = useCheckout({ stopOnAdjustment: true });
  const { items: state, addItem: addCart, removeItem: delCart } = useCart();

  const addItem = (product: CartItem) => {
    const available = stocks[Number(product.id)];
    if (checkStock(Number(product.id), product.qty, available)) return;
    addCart(product);
  };

  const removeItem = (product: CartItem) => {
    delCart(product);
    clearStockError(Number(product.id));
  };

  useEffect(() => {
    settingsService
      .getGst()
      .then((r: any) => {
        const val = Number(r.data?.data?.gst_percentage || r.data?.gst_percentage || r.data?.gstPercentage || 0);
        setGST(isNaN(val) ? 0 : val);
      })
      .catch(() => setGST(0));
  }, []);

  useEffect(() => {
    if (state.length === 0) return;
    const fetchStocks = async () => {
      const data: Record<number, number> = {};
      for (const item of state) {
        try {
          const r = await productService.customer.stock(Number(item.id));
          data[Number(item.id)] = r.data?.stock ?? 0;
        } catch {
          /* ignored */
        }
      }
      setStocks(data);
    };
    fetchStocks();
  }, [state]);

  const { baseAmount, gstAmount, totalAmount } = calcOrderTotals(state, GST, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 my-8 lg:my-12 bg-brand-cream font-body">
      <h1 className="text-brand font-heading text-4xl mb-8">Your cart</h1>

      {state.length === 0 ? (
        <EmptyState variant="cart" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product List */}
          <div className="lg:col-span-8">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 pb-4 mb-4 border-b border-brand-border-light text-brand font-semibold text-sm tracking-wide">
              <div className="col-span-6">Products</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Product Rows */}
            <div className="flex flex-col gap-6">
              {state.map((item) => {
                const { current, original, hasOffer } = getEffectivePrice(item);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pb-6 border-b border-brand-border-light last:border-b-0 relative"
                  >
                    {/* Products Column */}
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={formatProductName(item.product_name)}
                        className="w-24 h-24 object-contain bg-white rounded-[1rem] border border-brand-border-light shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-brand text-lg mb-1">
                          {formatProductName(item.product_name)}
                        </p>
                        {item.variant_label && (
                          <p className="text-brand-action font-medium text-sm">
                            {item.variant_label}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="col-span-1 md:col-span-2 text-brand font-medium md:text-center text-lg">
                      <div className="md:hidden text-xs text-brand-action mb-1 uppercase tracking-wider font-semibold">Price</div>
                      <div className="flex flex-col md:items-center">
                        <span>₹{current.toLocaleString()}</span>
                        {hasOffer && (
                          <span className="text-sm line-through text-gray-400">₹{original?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Column */}
                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                      <div className="md:hidden text-xs text-brand-action mb-1 uppercase tracking-wider font-semibold w-full">Quantity</div>
                      <div className="inline-flex items-center gap-2 bg-white border border-brand-border-light rounded-full px-2 py-1 shadow-sm">
                        <button
                          className="text-brand-action hover:text-brand transition-colors p-2"
                          onClick={() => removeItem(item)}
                          aria-label={item.qty > 1 ? "Decrease" : "Remove"}
                        >
                          {item.qty > 1 ? <Minus size={16} strokeWidth={2.5} /> : <Trash2 size={16} strokeWidth={2.5} />}
                        </button>
                        <span className="text-brand font-bold text-base w-6 text-center select-none">
                          {item.qty < 10 ? `0${item.qty}` : item.qty}
                        </span>
                        <button
                          className="text-brand-action hover:text-brand transition-colors p-2 disabled:opacity-50"
                          onClick={() => addItem(item)}
                          disabled={disabledQty[Number(item.id)]}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Total Column */}
                    <div className="col-span-1 md:col-span-2 text-brand font-bold text-lg md:text-right mt-2 md:mt-0">
                      <div className="md:hidden inline-block text-xs text-brand-action uppercase tracking-wider font-semibold mr-2">Total:</div>
                      ₹{(current * item.qty).toLocaleString()}
                    </div>

                    {stockError[Number(item.id)] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-0 left-0 md:left-auto md:right-0 px-3 py-1 bg-destructive text-white rounded text-xs font-semibold"
                      >
                        Stock limit reached!
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-brand text-brand-cream rounded-[2rem] p-8 sticky top-6 shadow-card">
              <div className="flex items-center gap-3 text-brand-cream/90 mb-4 border-b border-brand-cream/20 pb-4">
                <ShoppingBag size={20} />
                <span className="text-sm">Taxes and shipping calculated at checkout</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-brand-cream/90">
                  <span>Base Amount</span>
                  <span className="font-medium text-brand-cream">₹{baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-brand-cream/90">
                  <span>GST ({GST}%)</span>
                  <span className="font-medium text-brand-cream">₹{gstAmount.toLocaleString()}</span>
                </div>
              </div>

              <hr className="border-brand-cream/20 mb-4" />

              <div className="flex justify-between items-end mb-8">
                <h2 className="font-heading text-3xl font-medium m-0 text-brand-cream">Total</h2>
                <span className="text-2xl font-bold text-brand-action">₹{totalAmount.toLocaleString()}</span>
              </div>

              <div className="mb-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded border-2 border-brand-action peer-checked:bg-brand-action peer-checked:border-brand-action transition-all flex items-center justify-center">
                      {agreeTerms && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-brand-cream/90 leading-relaxed">
                    Agree to terms of sale as per the merchants terms of service.
                  </span>
                </label>
              </div>

              <Button
                className="w-full bg-brand-action hover:bg-[#639A40] text-white rounded-full py-6 text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={initiateCheckout}
                disabled={!agreeTerms}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
