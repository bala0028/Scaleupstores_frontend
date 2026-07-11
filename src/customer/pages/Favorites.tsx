import { useCallback, useEffect, useState } from "react";
import { useAuth, useCart } from "@/shared/stores";
import { toast } from "sonner";
import { favoriteService } from "@/shared/api/services";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { ProductSkeleton } from "../components/ProductSkeleton";
import { useStockCheck } from "@/shared/hooks";
import { productToCartItem } from "@/customer/utils/cartHelpers";
import type { Product } from "@/shared/api/services/types";

const Favorites = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user = useAuth().user;
  const navigate = useNavigate();
  const { items: cart, addItem: addCart, removeItem: delCart } = useCart();
  const { stockError, disabledQty, checkStock } = useStockCheck();

  const getCartQty = (id: number) => cart.find((p) => p.id === id)?.qty ?? 0;

  const addProduct = (product: Product) => {
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    const available = (product.available_stock ?? product.stock_quantity ?? 0) as number;
    if (available === 0) {
      toast.error("This product is out of stock!");
      return;
    }
    const currentQty = getCartQty(product.id);
    if (checkStock(product.id, currentQty, available)) return;
    addCart(productToCartItem(product));
    toast.success("Added to cart");
  };

  const fetchFavorites = useCallback(
    async (pageNo = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await favoriteService.customer.list(String(user?.id || 0), pageNo);
        const favData = res.data?.data || [];
        // API returns Favorite objects with nested product data
        const products = favData.map((fav: any) => ({
          id: fav.product_id,
          ...fav.product,
          ...fav,
        })) as Product[];
        setFavorites(products);
        setPage(res.data?.current_page || 1);
        setTotalPages(res.data?.total_pages || 1);
      } catch {
        toast.error("Could not load favorites");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user, navigate, fetchFavorites]);

  const toggleFavorite = async (productId: number) => {
    try {
      await favoriteService.customer.toggle(String(user?.id || 0), productId);
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed, try again");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 my-4 py-3">
      <h2 className="text-3xl font-bold text-center uppercase mb-4 text-brand">My Favorites</h2>

      {loading ? (
        <ProductSkeleton count={6} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-[18px] px-2.5">
            {favorites.length === 0 ? (
              <div className="col-span-full flex justify-center items-center min-h-[150px] py-5">
                <h3 className="text-brand whitespace-nowrap m-0 text-3xl font-semibold text-center">
                  No favorite products yet.
                </h3>
              </div>
            ) : (
              favorites.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  cartQty={getCartQty(product.id)}
                  isFavorite={true}
                  stockError={stockError[product.id]}
                  disabledQty={disabledQty[product.id]}
                  onAddToCart={addProduct}
                  onRemoveFromCart={(p) => delCart(productToCartItem(p))}
                  onToggleFavorite={toggleFavorite}
                  showFavorite={true}
                />
              ))
            )}
          </div>

          {favorites.length > 0 && (
            <div className="flex justify-center mt-8 mb-10 gap-4">
              <Button
                variant="brand"
                className="rounded-pill px-3.5 py-1.5 text-base"
                disabled={page === 1}
                onClick={() => fetchFavorites(page - 1)}
              >
                ‹ Prev
              </Button>
              <Button
                variant="brand"
                className="rounded-pill px-3.5 py-1.5 text-base"
                disabled={page === totalPages}
                onClick={() => fetchFavorites(page + 1)}
              >
                Next ›
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
