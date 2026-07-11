import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";
import { productService, favoriteService } from "@/shared/api/services";
import { useAuth, useCart } from "@/shared/stores";
import type { Product } from "@/shared/api/services/types";
import { productToCartItem } from "@/customer/utils/cartHelpers";
import OfferFloatingTab from "./offer/OfferFloatingTab";
import OfferProductCard from "./offer/OfferProductCard";
import { Button } from "@/components/ui/button";

const OfferModal = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [stockError, setStockError] = useState<Record<number, boolean>>({});
  const [disabledQty, setDisabledQty] = useState<Record<number, boolean>>({});

  const user = useAuth().user;
  const navigate = useNavigate();
  const { items, addItem: addCart, removeItem: delCart } = useCart();
  const isMobile = window.innerWidth <= 767;

  const getCartQty = (pid: number) => items.find((p) => p.id === pid)?.qty || 0;

  const fetchOfferProducts = async (pg: number, cat: string) => {
    setLoading(true);
    try {
      const res = await productService.customer.offers(pg);
      const d = res.data;
      setPage(d.current_page || 1);
      setTotalPages(d.total_pages || 1);
      setCategories(
        Array.from(new Set(d.data.map((p: Product) => p.category_name))).filter(Boolean) as string[]
      );
      setFiltered(
        cat && cat !== "all" ? d.data.filter((p: Product) => p.category_name === cat) : d.data
      );
    } catch {
      setFiltered([]);
    }
    setLoading(false);
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const r = await favoriteService.customer.ids(user.id as string | number);
      setFavorites(r.data.favorites || []);
    } catch {
      /* ignored */
    }
  }, [user]);

  useEffect(() => {
    if (show) {
      fetchOfferProducts(page, selectedCat);
      fetchFavorites();
    }
  }, [show, page, selectedCat]);

  const toggleFavorite = async (pid: number) => {
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    try {
      await favoriteService.customer.toggle(String(user.id || 0), pid);
      fetchFavorites();
    } catch {
      toast.error("Failed. Try again.");
    }
  };

  const addItem = (p: Product) => {
    if (p.stock_quantity && getCartQty(p.id) >= p.stock_quantity) {
      setStockError((s) => ({ ...s, [p.id]: true }));
      setDisabledQty((s) => ({ ...s, [p.id]: true }));
      setTimeout(() => {
        setStockError((s) => ({ ...s, [p.id]: false }));
        setDisabledQty((s) => ({ ...s, [p.id]: false }));
      }, 2000);
      return;
    }
    addCart(productToCartItem(p));
  };

  const removeItem = (p: Product) => {
    delCart(productToCartItem(p));
    setStockError((s) => {
      const n = { ...s };
      delete n[p.id];
      return n;
    });
  };

  const handleCat = (cat: string) => {
    setSelectedCat(cat);
    setPage(1);
  };
  const onNavigate = (id: number) => {
    setShow(false);
    navigate(`/product-detail/${id}`);
  };

  return (
    <>
      <OfferFloatingTab onClick={() => setShow(true)} />
      {show && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[5020]" onClick={() => setShow(false)} />
          <div
            className="fixed right-0 z-[5022] shadow-[0_8px_24px_rgba(122,86,58,0.1)] bg-brand-cream flex flex-col overflow-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
            style={{
              top: isMobile ? "auto" : 0,
              bottom: isMobile ? 0 : "auto",
              width: isMobile ? "100vw" : "48vw",
              height: "100vh",
              maxWidth: isMobile ? "100vw" : 470,
              borderRadius: isMobile ? "24px 24px 0 0" : "16px 0 0 16px",
              animation: isMobile ? "slideUpOffer .42s" : "slideLeftOffer .32s",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5">
              <h3 className="font-bold text-brand text-lg">Offer Products</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-3xl font-bold"
                onClick={() => setShow(false)}
              >
                ×
              </Button>
            </div>
            {/* Category pills */}
            <div className="flex flex-wrap gap-2.5 px-4 pt-4">
              <Button
                variant={selectedCat === "all" ? "brand" : "outline"}
                className="rounded-2xl"
                onClick={() => handleCat("all")}
              >
                All
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant={selectedCat === c ? "brand" : "outline"}
                  className="rounded-2xl"
                  onClick={() => handleCat(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
              {loading ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} height={280} />)
              ) : filtered.length === 0 ? (
                <div className="col-span-2 text-center text-brand font-semibold">
                  No offer products found.
                </div>
              ) : (
                filtered.map((p) => (
                  <OfferProductCard
                    key={p.id}
                    product={p}
                    favorites={favorites}
                    stockError={stockError}
                    disabledQty={disabledQty}
                    cartQty={getCartQty(p.id)}
                    onNavigate={onNavigate}
                    onToggleFav={toggleFavorite}
                    onAdd={addItem}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 px-3 pb-7">
              <Button
                variant="outline"
                className="rounded-2xl"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ Prev
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next ›
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OfferModal;
