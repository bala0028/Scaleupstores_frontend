import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { PriceDisplay, QuantitySelector, ProductImage } from "@/shared/components/customer-ui";
import { truncate, getEffectivePrice } from "@/shared/utils/customer";
import type { Product, Variant, Category } from "@/shared/api/services/types";
import { Star, ChevronDown, Heart, Truck, ShieldCheck, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  product: Product;
  variants: Variant[];
  stocks: Record<number, number>;
  stockError: Record<number, boolean>;
  disabledQty: Record<number, boolean>;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddItem: (p: Product) => void;
  onRemoveItem: (p: Product) => void;
  onShowDesc: () => void;
  onGoToReviews: () => void;
  onCheckout: () => void;
  getCartQty: (id: number) => number;
  user: any;
}

const ProductDetail = ({
  product,
  variants,
  stocks,
  stockError,
  disabledQty,
  isFavorite,
  onToggleFavorite,
  onAddItem,
  onRemoveItem,
  onShowDesc,
  onGoToReviews,
  onCheckout,
  getCartQty,
  user,
}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { current: price, original: originalPrice, hasOffer, offerPercent } = getEffectivePrice(product);
  const available = product.stockQuantity ?? product.stock_quantity ?? 0;
  const outOfStock = available === 0;
  const stockLow = available <= 10 && available > 0;
  const desc = product.productDescription || product.product_description || "";
  const qty = getCartQty(product.id);

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const categoryName =
    typeof product.category === "object" && product.category
      ? (product.category as Category).categoryName ?? (product.category as Category).category_name ?? ""
      : "";

  const rating = Number(product.average_rating ?? product.averageRating ?? 0);

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ─── Image Section ─── */}
        <div className="w-full lg:w-[48%]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Category Badge */}
            {categoryName && (
              <motion.span
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute top-4 left-4 z-10 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
              >
                {categoryName}
              </motion.span>
            )}

            {/* Favorite Button */}
            {user && (
              <motion.button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer border-0 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
              >
                <Heart
                  size={20}
                  className={`transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                />
              </motion.button>
            )}

            {/* Offer Badge */}
            {hasOffer && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="absolute top-4 right-16 z-10 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/25"
              >
                {offerPercent}% OFF
              </motion.div>
            )}

            {/* Stock Error Toast */}
            <AnimatePresence>
              {stockError[product.id] && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
                >
                  Stock limit reached!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Image */}
            <div className="flex items-center justify-center w-full h-full p-8">
              <ProductImage
                src={product.image ?? product.product_image ?? product.productImage ?? undefined}
                alt={product.productName ?? ""}
                className="max-h-full max-w-full object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Stock Badges */}
            {outOfStock && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  Out of Stock
                </span>
              </div>
            )}
            {!outOfStock && stockLow && (
              <div className="absolute bottom-4 left-4 z-10">
                <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  Only {available} left — Hurry!
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Product Info Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full lg:w-[52%] flex flex-col"
        >
          {/* Category Label */}
          {categoryName && (
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600 mb-1.5">
              {categoryName}
            </span>
          )}

          {/* Product Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {product.productName || product.product_name || ""}
          </h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={`${star <= Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                    } transition-colors`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{rating.toFixed(1)}</span>
            <button
              onClick={onGoToReviews}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 underline-offset-2 hover:underline bg-transparent border-0 cursor-pointer transition-colors"
            >
              View Reviews
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {hasOffer && originalPrice && (
              <>
                <s className="text-lg text-gray-400 font-medium">₹{originalPrice.toLocaleString()}</s>
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Save {offerPercent}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {desc.length > 300 ? truncate(desc, 300) : desc}
              {desc.length > 300 && (
                <span
                  onClick={onShowDesc}
                  className="text-emerald-600 font-semibold cursor-pointer ml-1 hover:text-emerald-700 transition-colors"
                >
                  Read more
                </span>
              )}
            </p>
          </div>

          {/* Tags / Pills */}
          {/* <div className="flex flex-wrap gap-2 mb-6">
            {[
              { icon: "🌿", label: "Natural" },
              { icon: "🧪", label: "Dermatologically tested" },
              { icon: "🐰", label: "Cruelty free" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <span>{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div> */}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const isActive = Number(id) === Number(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/product-detail/${v.id}`)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${isActive
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20"
                          : "bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600"
                        }`}
                    >
                      {v.quantity} {v.quantityUnit}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to Cart / Quantity */}
          <div className="flex items-center gap-3 mb-6">
            {outOfStock ? (
              <div className="bg-red-50 border border-red-200 text-red-600 font-semibold px-6 py-3 rounded-xl text-sm">
                Out of Stock
              </div>
            ) : qty === 0 ? (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 h-12 rounded-xl text-base shadow-md shadow-emerald-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30"
                onClick={() => onAddItem(product)}
              >
                Add to Cart
              </Button>
            ) : (
              <QuantitySelector
                value={qty}
                onIncrement={() => onAddItem(product)}
                onDecrement={() => onRemoveItem(product)}
                max={disabledQty[product.id] ? qty : undefined}
                size="md"
              />
            )}
            {!outOfStock && qty > 0 && (
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 h-12 rounded-xl text-base transition-all duration-200"
                onClick={onCheckout}
              >
                Go to Checkout
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-5" />

          {/* Accordion Sections */}
          {/* <div className="space-y-0">
            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between py-4 bg-transparent border-0 cursor-pointer text-left"
                onClick={() => toggleAccordion("details")}
              >
                <span className="text-sm font-semibold text-gray-800">Ingredients & Details</span>
                <motion.span
                  animate={{ rotate: openAccordion === "details" ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-gray-500" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openAccordion === "details" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                      {desc || "Product details will be available soon."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-b border-gray-100">
              <button
                className="w-full flex items-center justify-between py-4 bg-transparent border-0 cursor-pointer text-left"
                onClick={() => toggleAccordion("shipping")}
              >
                <span className="text-sm font-semibold text-gray-800">Shipping & Delivery</span>
                <motion.span
                  animate={{ rotate: openAccordion === "shipping" ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="text-gray-500" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openAccordion === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Truck size={16} className="text-emerald-600 shrink-0" />
                        <span>Free shipping on orders above ₹499</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Package size={16} className="text-emerald-600 shrink-0" />
                        <span>Estimated delivery: 3-5 business days</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <RotateCcw size={16} className="text-emerald-600 shrink-0" />
                        <span>Easy 7-day returns & exchanges</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                        <span>100% authentic products</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div> */}

        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
