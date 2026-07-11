import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { productService, categoryService } from "@/shared/api/services";
import { toast } from "sonner";
import { Star } from "lucide-react";
import type { DialogPageProps } from "@/admin/types";
import type { Product } from "@/shared/api/services/types";

export default function ViewProduct({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.admin.getById(entityId);
        const data = res.data.data;
        setProduct(data);
        if (data.category) {
          try {
            // category can be a number (ID) or Category object
            const categoryId = typeof data.category === 'object' ? data.category.id : data.category;
            const categoryRes = await categoryService.admin.getById(categoryId);
            setCategoryName(categoryRes.data.data.category_name ?? categoryRes.data.data.categoryName ?? "N/A");
          } catch {
            setCategoryName("N/A");
          }
        }
        if (data.product_image) setImageUrl(data.product_image);
      } catch (err: unknown) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
        toast.error("Error loading product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [entityId, open]);

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "text-yellow-500" : "text-muted-foreground"}`}
      />
    ));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-center">View Product</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-4">{error}</div>
          ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <p>
                <strong>Product Name:</strong> {product.product_name}
              </p>
              <p>
                <strong>Category:</strong> {categoryName || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> ₹{product.price}
              </p>
              <p>
                <strong>Quantity:</strong> {product.quantity} {product.quantity_unit?.toUpperCase()}
              </p>
              <p>
                <strong>Stock:</strong> {product.stockQuantity}
              </p>
              <div className="flex flex-col">
                <p>
                  <strong>Rating:</strong>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(Math.round(product.average_rating || 0))}</div>
                  <span className="text-yellow-600 font-semibold">
                    {Number(product.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {product.productDescription || "No description available."}
                </div>
              </div>
              <p>
                <strong>Created By:</strong> {product.created_by_name || "—"}
              </p>
              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Product Image:</p>
                  <div className="w-72 h-48 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <DialogFooter className="justify-center">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
