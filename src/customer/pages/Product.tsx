import { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useCart } from "@/shared/stores";
import { useCheckout, useStockCheck } from "@/shared/hooks";
import { productService, variantService, favoriteService } from "@/shared/api/services";
import { toast } from "sonner";
import { productToCartItem } from "@/customer/utils/cartHelpers";
import ReviewBox from "../components/ReviewBox";
import ProductDetail from "./product/ProductDetail";
import SimilarProducts from "./product/SimilarProducts";
import DescriptionModal from "./product/DescriptionModal";
import type { Product as ProductType, Variant } from "@/shared/api/services/types";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuth().user;
  const { items: cartItems, addItem: addCart, removeItem: delCart } = useCart();
  const { stockError, disabledQty, checkStock } = useStockCheck();
  const { initiateCheckout } = useCheckout();
  const reviewRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [stocks, setStocks] = useState<Record<number, number>>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showDescModal, setShowDescModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getCartQty = (pid: number) => cartItems.find((p) => p.id === pid)?.qty || 0;

  const addItem = (p: ProductType) => {
    const avail = p.stockQuantity ?? p.stock_quantity ?? stocks[p.id];
    if (checkStock(p.id, getCartQty(p.id), avail)) return;
    addCart({
      ...productToCartItem(p),
      variant_label: p.quantity && p.quantity_unit ? `${p.quantity} ${p.quantity_unit}` : null,
    });
    navigate("/cart");
  };

  const removeItem = (p: ProductType) => delCart(productToCartItem(p));

  const goToReviews = () => {
    window.scrollTo({ top: (reviewRef.current?.offsetTop ?? 0) - 80, behavior: "smooth" });
  };

  const toggleFavorite = async () => {
    if (!user?.id) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    try {
      const res = await favoriteService.customer.toggle(user.id, product!.id);
      setIsFavorite(res.data?.is_favorite ?? false);
      toast.success(res.data?.is_favorite ? "Added to favorites ❤️" : "Removed from favorites");
    } catch {
      toast.error("Failed, please try again");
    }
  };

  // Fetch product + variants + similar
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      setLoadingSimilar(true);
      try {
        const res = await productService.customer.detail(id);
        const data = res.data?.data as ProductType;
        console.log(data, 'product');
        setProduct(data);
        if (data && !data.parent) {
          try {
            const rv = await variantService.filter(data.id);
            setVariants((rv.data?.data as Variant[]) || []);
            console.log(rv.data?.data, 'variants');
          } catch {
            /* ignored */
          }
        }
        setLoading(false);
        if (user?.id && data?.id) {
          try {
            const fr = await favoriteService.customer.check(user.id, data.id);
            setIsFavorite(fr.data?.favorites?.includes(data.id) ?? false);
          } catch {
            /* ignored */
          }
        }
        if (data?.category) {
          const categoryId = typeof data.category === 'object' ? data.category.id : data.category;
          const rs = await productService.customer.byCategory(categoryId, 1);
          const raw = rs.data as any;
          const rawList = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : [];
          setSimilarProducts(rawList.filter((i: ProductType) => i.id !== data.id));
        } else {
          setSimilarProducts([]);
        }
        setLoadingSimilar(false);
      } catch (e) {
        console.error("Error fetching product:", e);
        setLoading(false);
        setLoadingSimilar(false);
      }
    };
    fetch();
  }, [id, user?.id]);

  // Fetch stocks
  useEffect(() => {
    if (!product && similarProducts.length === 0) return;
    const fetch = async () => {
      try {
        const stockData: Record<number, number> = {};
        if (product?.id) {
          const r = await productService.customer.stock(product.id);
          stockData[product.id] = Number(r.data?.stock ?? product.stock_quantity ?? 0);
        }
        if (similarProducts.length > 0) {
          const results = await Promise.all(
            similarProducts.map((p) =>
              productService.customer
                .stock(p.id)
                .then((r) => ({ id: p.id, stock: Number(r.data?.stock ?? 0) }))
                .catch(() => ({ id: p.id, stock: Number(p.stock_quantity ?? 0) }))
            )
          );
          results.forEach((r) => {
            stockData[r.id] = r.stock;
          });
        }
        setStocks((prev) => ({ ...prev, ...stockData }));
      } catch (e) {
        console.error("Stock fetch error:", e);
      }
    };
    fetch();
  }, [product, similarProducts]);

  const LoadingSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 my-5 py-2">
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 py-3">
          <Skeleton height={350} width={350} />
        </div>
        <div className="w-full md:w-1/2 px-2 py-5">
          <Skeleton height={25} width={200} />
          <Skeleton height={80} />
          <Skeleton height={35} width={70} />
          <Skeleton height={40} width={110} />
          <Skeleton height={100} />
          <Skeleton height={35} width={110} inline />
          <Skeleton className="mx-3" height={35} width={110} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--color-brand-cream)]">
      {loading || !product ? (
        <LoadingSkeleton />
      ) : (
        <ProductDetail
          product={product}
          variants={variants}
          stocks={stocks}
          stockError={stockError}
          disabledQty={disabledQty}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onShowDesc={() => setShowDescModal(true)}
          onGoToReviews={goToReviews}
          onCheckout={initiateCheckout}
          getCartQty={getCartQty}
          user={user}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-5" ref={reviewRef}>
        {product?.id && <ReviewBox productId={product.id} />}
      </div>
      <SimilarProducts
        products={similarProducts}
        loading={loadingSimilar}
        stocks={stocks}
        stockError={stockError}
        disabledQty={disabledQty}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        getCartQty={getCartQty}
      />
      {showDescModal && product?.product_description && (
        <DescriptionModal
          description={product.product_description}
          onClose={() => setShowDescModal(false)}
        />
      )}
    </div>
  );
};

export default Product;
