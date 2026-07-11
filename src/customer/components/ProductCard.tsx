import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { truncate, getEffectivePrice } from "@/shared/utils";
import { Product, Category } from "@/shared/api/services/types";
import { cn } from "@/lib/utils";

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${n}`;
}

interface ProductCardProps {
  product: Product;
  index: number;
  cartQty: number;
  isFavorite?: boolean;
  stockError?: boolean;
  disabledQty?: boolean;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onToggleFavorite?: (productId: number) => void;
  showFavorite?: boolean;
}

export function ProductCard({
  product,
  index: _index,
  cartQty,
  isFavorite,
  stockError,
  disabledQty,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite,
  showFavorite = true,
}: ProductCardProps) {
  const navigate = useNavigate();
  const [heartAnimating, setHeartAnimating] = useState(false);
  const { current, original, hasOffer, offerPercent } = getEffectivePrice(product);
  const available = product.stockQuantity ?? product.stockQuantity ?? 0;
  const outOfStock = available === 0;
  const stockLow = available <= 10 && available > 0;
  const name = product.productName || product.name || "";
  const description = product.productDescription || product.product_description || "";
  const img = (product.productImage ?? product.product_image ?? product.image) as string | undefined;
  const imgSrc = img ? (img.startsWith("http") ? img : `${import.meta.env.VITE_API_URL}${img}`) : "";
  const rating = Number(product.averageRating ?? product.average_rating ?? 0);
  const reviewCount = (product.feedbackCount ?? product.feedback_count ?? product.reviewCount) as
    | number
    | undefined;
  const categoryLabel =
    product.categoryName ||
    product.category_name ||
    (typeof product.category === "object" ? (product.category as Category)?.categoryName : undefined);

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300`}
      onClick={() => {
        if (!outOfStock) navigate(`/product-detail/${product.id}`);
      }}
    >
      {/* ── Image tile ── */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-brand-cream p-4">
        {/* Status badges — top-left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {hasOffer && (
            <span className="rounded-md bg-green-500 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
              {offerPercent}% off
            </span>
          )}
          {outOfStock && (
            <span className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Out of Stock
            </span>
          )}
          {!outOfStock && stockLow && (
            <span className="rounded-md bg-warning px-2.5 py-1 text-xs font-semibold text-black shadow-sm">
              Hurry! Only {available} left
            </span>
          )}
        </div>

        {/* Wishlist — top-right */}
        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              if (onToggleFavorite) {
                onToggleFavorite(product.id);
              }

              setHeartAnimating(true);
              setTimeout(() => setHeartAnimating(false), 400);
            }}
            className="absolute right-2 top-2 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
            aria-label={
              isFavorite ? "Remove from favourites" : "Add to favourites"
            }
          >
            <motion.div
              animate={heartAnimating ? { scale: [1, 1.35, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                size={18}
                className={
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500 hover:text-red-500"
                }
              />
            </motion.div>
          </button>
        )}

        
        {stockError && (
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-destructive text-white rounded-2xl text-sm font-semibold z-[99] whitespace-nowrap shadow-[0_3px_10px_rgba(0,0,0,0.2)]"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: [100, 0, -6, 6, -6, 6, 0], opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Stock limit reached!
          </motion.div>
        )}

        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-contain transition-transform duration-300"
        />
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-3">
        {categoryLabel && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            {categoryLabel}
          </span>
        )}

        <h3 className="truncate text-base font-semibold text-gray-900">{truncate(name, 22)}</h3>

        {description && (
          <p className="line-clamp-1 text-sm text-gray-500">{description}</p>
        )}

        {rating > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
            {reviewCount != null && (
              <span className="text-gray-400">({formatCount(reviewCount)} Review)</span>
            )}
          </div>
        )}

        <div className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-lg font-bold text-gray-900">₹{current.toLocaleString()}</span>
          {hasOffer && (
            <span className="text-sm text-gray-400 line-through">₹{original!.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* ── Action ── */}
      <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {outOfStock ? (
          <span className="block w-full rounded-full border border-destructive px-3.5 py-2.5 text-center text-sm font-semibold text-destructive">
            Out of Stock
          </span>
        ) : cartQty === 0 ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-900 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-full border border-gray-900 px-3 py-1.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => onRemoveFromCart(product)}
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-base font-bold text-gray-900">{cartQty}</span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onAddToCart(product)}
              disabled={disabledQty}
              aria-label="Increase"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
