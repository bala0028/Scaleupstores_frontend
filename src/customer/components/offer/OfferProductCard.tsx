import { motion } from "framer-motion";
import type { Product } from "@/shared/api/services/types";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getEffectivePrice } from "@/shared/utils";

interface Props {
  product: Product;
  favorites: number[];
  stockError: Record<number, boolean>;
  disabledQty: Record<number, boolean>;
  cartQty: number;
  onNavigate: (id: number) => void;
  onToggleFav: (id: number) => void;
  onAdd: (p: Product) => void;
  onRemove: (p: Product) => void;
}

const OfferProductCard = ({
  product,
  favorites,
  stockError,
  disabledQty,
  cartQty,
  onNavigate,
  onToggleFav,
  onAdd,
  onRemove,
}: Props) => {
  const { current: price, original: originalPrice, hasOffer, offerPercent } = getEffectivePrice(product);
  const available = Number(product.stockQuantity ?? product.stock_quantity ?? 0);
  const isAvailable = product.is_available ?? product.isAvailable ?? product.isActive ?? product.is_active ?? true;
  const outOfStock = !isAvailable || available === 0;
  const lowStock = available <= 10 && available > 0;
  const name = product.product_name || product.name || "";

  return (
    <div
      className="relative bg-brand-cream rounded-card overflow-hidden border-[1.5px] border-brand-border cursor-pointer group"
      onClick={() => onNavigate(product.id)}
    >
      {/* Favorite */}
      <motion.div
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(product.id);
        }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2.5 right-2.5 cursor-pointer z-50"
      >
        <div className="w-[26px] h-[26px] rounded-full bg-white/90 shadow flex items-center justify-center backdrop-blur-sm">
          {favorites.includes(product.id) ? (
            <span className="text-xs">❤️</span>
          ) : (
            <span className="text-xs text-gray-500">🤍</span>
          )}
        </div>
      </motion.div>

      {/* Badges */}
      {hasOffer && (
        <span className="absolute top-[140px] left-0 bg-gradient-to-br from-brand-action to-brand text-white px-[5px] py-[2px] text-xs font-semibold rounded-r-md z-10">
          {offerPercent}% OFF
        </span>
      )}
      {outOfStock && (
        <span className="absolute top-[45px] left-0 px-3 py-1 text-xs font-semibold rounded-r-md z-[12] bg-red-600 text-white">
          Out of Stock
        </span>
      )}
      {!outOfStock && lowStock && (
        <span className="absolute top-[10px] left-0 px-3 py-1 text-xs font-semibold rounded-r-md z-[12] bg-yellow-500 text-black">
          Hurry! Only {product.stock_quantity ?? 0} left
        </span>
      )}
      {stockError[product.id] && (
        <motion.div
          className="absolute top-2 left-[38%] -translate-x-1/2 px-3.5 py-1.5 bg-red-600 text-white rounded-2xl text-xs font-semibold z-[99] whitespace-nowrap shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: [100, 0, -6, 6, -6, 6, 0], opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Stock limit reached!
        </motion.div>
      )}

      {/* Image */}
      <div className="h-[150px] bg-brand-cream flex items-center justify-center overflow-hidden">
        <img
          src={getImageUrl(product.product_image)}
          alt={name}
          className="w-4/5 h-full object-contain bg-brand-cream transition-transform duration-[320ms] group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="text-center p-3">
        <h5 className="font-bold text-sm">{name.length > 15 ? name.slice(0, 15) + "..." : name}</h5>
        <p className="text-muted-foreground text-sm leading-5 line-clamp-3">
          {(product.product_description || "").slice(0, 60)}...
        </p>
        <div className="mt-2">
          {hasOffer ? (
            <>
              <span className="text-brand font-bold">
                ₹{price.toLocaleString()}
              </span>
              <span className="text-destructive ml-1">
                <s>₹{originalPrice!.toLocaleString()}</s>
              </span>
            </>
          ) : (
            <span className="text-brand font-bold">
              ₹{price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Cart buttons */}
      <div className="flex justify-center pb-3">
        <div onClick={(e) => e.stopPropagation()}>
          {(product.stock_quantity || 0) === 0 ? (
            <span className="text-sm font-semibold text-destructive">Out of Stock</span>
          ) : cartQty === 0 ? (
            <Button variant="brand" size="sm" onClick={() => onAdd(product)}>
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="brand"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => onRemove(product)}
              >
                <Minus size={14} />
              </Button>
              <span className="text-sm font-semibold min-w-[1.5rem] text-center">{cartQty}</span>
              <Button
                variant="brand"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => onAdd(product)}
                disabled={disabledQty[product.id]}
              >
                <Plus size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferProductCard;
