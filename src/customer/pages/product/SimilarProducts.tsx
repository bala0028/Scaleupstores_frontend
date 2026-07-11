import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LoadingSpinner,
  PriceDisplay,
  QuantitySelector,
  ProductImage,
} from "@/shared/components/customer-ui";
import type { Product } from "@/shared/api/services/types";
import { useCart } from "@/shared/contexts/CartContext";
import { getEffectivePrice } from "@/shared/utils";

interface Props {
  products: Product[];
  loading: boolean;
  stocks: Record<number, number>;
  stockError: Record<number, boolean>;
  disabledQty: Record<number, boolean>;
  onAddItem: (p: Product) => void;
  onRemoveItem: (p: Product) => void;
  getCartQty: (id: number) => number;
}

const SimilarProducts = ({
  products,
  loading,
  stocks,
  stockError,
  disabledQty,
  onAddItem,
  onRemoveItem,
  getCartQty,
}: Props) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const cartItems = useCart().items;

  const saveScroll = () => {
    if (scrollRef.current) scrollPosRef.current = scrollRef.current.scrollLeft;
  };
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollPosRef.current;
  }, [cartItems]);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 my-4 py-3">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="my-5 max-w-7xl mx-auto px-4">
      <h4 className="mb-3 font-bold text-brand">You may also like</h4>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-[15px] pb-3 [scrollbar-width:thin] [scrollbar-color:var(--color-brand)_var(--color-brand-border-light)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-brand-border-light [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-brand [&::-webkit-scrollbar-thumb]:rounded-lg"
      >
        {products.map((item) => {
          const { current: price, original: originalPrice, hasOffer, offerPercent } = getEffectivePrice(item);
          const available = Number(stocks[item.id] ?? item.stockQuantity ?? item.stock_quantity ?? 0);
          const isAvailable = item.is_available ?? item.isAvailable ?? item.isActive ?? item.is_active ?? true;
          const outOfStock = !isAvailable || available === 0;
          const stockLow = available <= 10 && available > 0;
          const qty = getCartQty(item.id);

          return (
            <div
              key={item.id}
              className="flex-none w-[160px] bg-brand-cream rounded-card border-[1.5px] border-brand-border shadow-[0_2px_7px_rgba(0,0,0,0.1)] transition-[transform,box-shadow] duration-200 relative text-center cursor-pointer hover:scale-[1.09] hover:shadow-[0_7px_18px_rgba(112,168,77,0.2)]"
              style={outOfStock ? { opacity: 0.5, pointerEvents: "none" } : {}}
              onClick={() => {
                if (!outOfStock) navigate(`/product-detail/${item.id}`);
              }}
            >
              {hasOffer && (
                <div className="absolute top-[10px] right-0 bg-gradient-to-br from-brand-action to-brand text-white px-[5px] py-[2px] text-xs font-semibold rounded-md shadow-[0_2px_5px_rgba(0,0,0,0.15)] z-[5]">
                  {offerPercent}% OFF
                </div>
              )}
              {outOfStock && (
                <span className="absolute left-px bottom-[220px] px-[6px] py-[2px] text-sm font-semibold rounded-r-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.14)] z-[9] bg-destructive text-white">
                  Out of Stock
                </span>
              )}
              {!outOfStock && stockLow && (
                <span className="absolute left-px bottom-[220px] px-[6px] py-[2px] text-sm font-semibold rounded-r-[6px] shadow-[0_1px_4px_rgba(0,0,0,0.14)] z-[9] bg-warning text-black">
                  Hurry! Only {available} left
                </span>
              )}
              {stockError[item.id] && (
                <motion.div
                  className="absolute top-[15px] left-px px-[10px] py-1 bg-destructive text-white rounded-r-[6px] text-xs font-semibold z-[999] whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.15)] pointer-events-none"
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: [80, 0, -6, 6, -6, 6, 0], opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  Stock limit reached!
                </motion.div>
              )}
              <div className="p-2 bg-gray-50 rounded relative">
                <ProductImage
                  src={item.product_image}
                  alt={item.product_name ?? ""}
                  className="w-full h-[120px] object-contain"
                />
              </div>
              <div className="p-2">
                <h6 className="text-brand text-sm truncate">
                  {(item.product_name || "").length > 18
                    ? item.product_name!.substring(0, 18) + "..."
                    : item.product_name}
                </h6>
                <PriceDisplay
                  price={price}
                  originalPrice={originalPrice ?? undefined}
                />
                <div className="flex justify-center mt-1" onClick={(e) => e.stopPropagation()}>
                  {outOfStock ? (
                    <span className="bg-destructive text-white px-3 py-1 rounded-pill text-sm font-semibold">
                      Out of Stock
                    </span>
                  ) : qty === 0 ? (
                    <Button
                      variant="brand"
                      className="rounded-pill px-3 py-1 text-sm font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveScroll();
                        onAddItem(item);
                      }}
                    >
                      Add
                    </Button>
                  ) : (
                    <QuantitySelector
                      value={qty}
                      onIncrement={() => {
                        saveScroll();
                        onAddItem(item);
                      }}
                      onDecrement={() => onRemoveItem(item)}
                      max={disabledQty[item.id] ? qty : undefined}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarProducts;
