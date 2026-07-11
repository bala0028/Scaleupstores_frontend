import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productService } from "@/shared/api/services";
import { PriceDisplay, LoadingSpinner, EmptyState } from "@/shared/components/customer-ui";
import { getEffectivePrice } from "@/shared/utils";
import { truncate, getImageUrl } from "@/shared/utils/customer";
import type { Product } from "@/shared/api/services/types";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q") || "";
    setSearchTerm(query);
    if (query) fetchResults(query);
  }, [location.search]);

  const fetchResults = async (query: string) => {
    try {
      setLoading(true);
      const res = await productService.customer.search(query);
      setResults((res.data.data as Product[]) || []);
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length >= 1) fetchResults(value);
    else setResults([]);
  };

  return (
    <div className="w-full px-4 py-3 min-h-screen bg-brand-cream">
      <div className="flex items-center gap-3 mb-3 px-3 border-b border-brand-border pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-brand"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
        </Button>
        <h5 className="font-semibold mb-0 flex-1">Search</h5>
      </div>

      <div className="flex flex-wrap -mx-2 gap-3">
        <div className="w-full lg:w-1/4 px-2 hidden lg:block" />
        <div className="w-full lg:w-1/2 px-2">
          <div className="relative flex items-center mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={handleChange}
              className="pl-10 bg-white border-brand-border h-[42px]"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-auto w-auto p-0"
                onClick={() => {
                  setSearchTerm("");
                  setResults([]);
                }}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {loading ? (
            <LoadingSpinner fullPage />
          ) : results.length === 0 && searchTerm.length > 1 ? (
            <EmptyState variant="search" />
          ) : (
            <div>
              {results.map((product) => {
                const { current, original, hasOffer, offerPercent } = getEffectivePrice(product);
                const available = Number(product.stockQuantity ?? product.stock_quantity ?? 0);
                const isAvailable = product.is_available ?? product.isAvailable ?? product.isActive ?? product.is_active ?? true;
                const outOfStock = !isAvailable || available === 0;
                const lowStock = available <= 8 && available > 0;

                return (
                  <div
                    key={product.id}
                    className="flex flex-wrap -mx-2 relative"
                    style={outOfStock ? { opacity: 0.6, pointerEvents: "none" } : {}}
                  >
                    {hasOffer && (
                      <span className="absolute top-[75px] left-[20%] md:top-[87px] md:left-[140px] px-2 py-1 text-xs font-semibold rounded bg-gradient-to-br from-brand-action to-brand text-white">
                        {offerPercent}% OFF
                      </span>
                    )}
                    {outOfStock ? (
                      <span className="absolute top-px left-0 md:left-[215px] px-2 py-1 text-xs font-semibold rounded bg-destructive text-white">
                        Out of Stock
                      </span>
                    ) : lowStock ? (
                      <span className="absolute top-px left-0 md:left-[190px] px-2 py-1 text-xs font-semibold rounded bg-warning text-black">
                        Hurry! Only {available} left
                      </span>
                    ) : null}

                    <div className="flex-1">
                      <h6 className="font-semibold mb-1 text-foreground">{product.product_name}</h6>
                      <p className="text-muted-foreground text-sm mb-1 max-w-[90%]">
                        {truncate(product.product_description || "", 50)}
                      </p>
                      <PriceDisplay
                        price={current}
                        originalPrice={hasOffer ? original! : undefined}
                      />
                    </div>

                    <div className="flex flex-col items-end">
                      <img
                        src={getImageUrl(product.product_image)}
                        alt={product.product_name}
                        className="w-[70px] h-[70px] object-cover rounded-md border border-border"
                      />
                      <Button
                        variant="outline"
                        className="text-brand border-brand rounded-pill px-[15px] py-[5px] font-semibold hover:bg-brand hover:text-white mr-2 mb-2"
                        onClick={() => navigate(`/product-detail/${product.id}`)}
                        disabled={outOfStock}
                      >
                        {outOfStock ? "Out" : "ADD"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="w-full lg:w-1/4 px-2 hidden lg:block" />
      </div>
    </div>
  );
};

export default SearchResults;
