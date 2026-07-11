import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "@/shared/stores";
import { toast } from "sonner";
import { favoriteService, categoryService, productService } from "@/shared/api/services";
import { useStockCheck } from "@/shared/hooks";
import { productToCartItem } from "@/customer/utils/cartHelpers";
import CategorySidebar from "./CategorySidebar";
import CategoryGrid from "./CategoryGrid";
import { ProductCard, ProductSkeleton } from "@/customer/components";
import type { Product, Category } from "@/shared/api/services/types";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  console.log(categories,'categories')

  const { stockError, disabledQty, checkStock, clearStockError } = useStockCheck();

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const user = useAuth().user;
  const navigate = useNavigate();
  const location = useLocation();
  const { items: state, addItem: addCart, removeItem: delCart } = useCart();

  const getCartQty = (id: number) => state.find((p) => p.id === id)?.qty ?? 0;

  // ─── Group products by category ───
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    let name = p.categoryName || p.category_name;
    if (!name && typeof p.category === 'object' && p.category) {
      name = (p.category as any).categoryName || (p.category as any).category_name;
    }
    name = name || "Uncategorized";
    (acc[name] ??= []).push(p);
    return acc;
  }, {});
  
  // Ensure "Uncategorized" category exists for products without category
  const hasUncategorized = grouped["Uncategorized"] && grouped["Uncategorized"].length > 0;
  const displayCategories = hasUncategorized 
    ? [...categories, { id: 0, categoryName: "Uncategorized" } as Category]
    : categories;

  const toggleFavorite = async (productId: number) => {
    if (!user) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    try {
      await favoriteService.customer.toggle(String(user?.id || 0), productId);
      fetchFavorites();
    } catch {
      toast.error("Failed, try again");
    }
  };

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await favoriteService.customer.ids(user.id as string | number);
      setFavorites(res.data?.favorites || []);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.customer.list();
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchProducts = useCallback(async (categoryId: number | null = null) => {
    setLoading(true);
    try {
      const res = categoryId
        ? await productService.customer.byCategory(categoryId)
        : await productService.customer.list();
      setProducts(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFavorites();
    if (!location.state?.categoryId) fetchProducts();
  }, [fetchCategories, fetchProducts, fetchFavorites, location.state]);

  const addItem = (product: Product) => {
    const available = (product.available_stock ?? product.stock_quantity) as number | undefined;
    if (checkStock(product.id, getCartQty(product.id), available)) return;
    addCart(productToCartItem(product));
  };

  const removeItem = (product: Product) => {
    delCart(productToCartItem(product));
    clearStockError(product.id);
  };

  // ─── Category scroll logic ───
  const scrollToCategory = (categoryId: number) => {
    const cat = displayCategories.find((c) => c.id === categoryId);
    const el = sectionRefs.current[(cat?.categoryName || cat?.category_name) || ""];
    if (!el) {
      toast.error("No products available in this category!");
      return;
    }
    setSelectedCat(categoryId);
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.pageYOffset - 100,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!displayCategories.length || !products.length) return;
    const handleScroll = () => {
      let current: string | null = null,
        minDist = Infinity;
      Object.entries(sectionRefs.current).forEach(([name, el]) => {
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top - 120);
        if (el.getBoundingClientRect().top <= 120 && dist < minDist) {
          minDist = dist;
          current = name;
        }
      });
      if (current) {
        const cat = displayCategories.find((c) => (c.categoryName || c.category_name) === current);
        if (cat && selectedCat !== cat.id) setSelectedCat(cat.id);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCategories, products, selectedCat]);

  useEffect(() => {
    const categoryId = location.state?.categoryId;
    if (!categoryId || !displayCategories.length) return;
    setSelectedCat(categoryId);
    fetchProducts(categoryId);
    const t = setTimeout(() => {
      const cat = displayCategories.find((c) => c.id === categoryId);
      const el = (cat?.categoryName || cat?.category_name) ? sectionRefs.current[(cat.categoryName || cat.category_name)!] : null;
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.pageYOffset - 100,
          behavior: "smooth",
        });
    }, 1200);
    return () => clearTimeout(t);
  }, [location.state, displayCategories, fetchProducts]);

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="w-full px-4">
        <div className="pt-4">
          <CategoryGrid categories={displayCategories} onCategoryClick={scrollToCategory} />
        </div>

        <div className="flex items-start gap-5 mt-6">
          <aside className="hidden lg:block sticky top-[90px] self-start z-10">
            <CategorySidebar
              categories={displayCategories}
              selectedCat={selectedCat}
              handleCategory={scrollToCategory}
            />
          </aside>

          <main className="flex-1 my-4 py-3">
            <h2 className="text-3xl font-bold text-center uppercase mb-6 text-brand">
              Our Products
            </h2>

            {loading ? (
              <ProductSkeleton count={6} />
            ) : (
              displayCategories
                .filter((cat) => (cat.categoryName || cat.category_name) && grouped[(cat.categoryName || cat.category_name)!])
                .map((cat) => {
                  const name = (cat.categoryName || cat.category_name)!;
                  return (
                    <section
                      key={name}
                      ref={(el) => {
                        if (el) sectionRefs.current[name] = el;
                      }}
                      className="mb-8"
                    >
                      <h3 className="text-black text-lg font-bold mb-4 uppercase tracking-wide">
                        {name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-[18px] px-2.5">
                        {grouped[name].map((product, idx) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={idx}
                            cartQty={getCartQty(product.id)}
                            isFavorite={favorites.includes(product.id)}
                            stockError={stockError[product.id]}
                            disabledQty={disabledQty[product.id]}
                            onAddToCart={addItem}
                            onRemoveFromCart={removeItem}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
