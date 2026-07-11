import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { variantService } from "@/shared/api/services";
import { toast } from "sonner";
import { Star } from "lucide-react";
import type { DialogPageProps } from "@/admin/types";
import type { Variant } from "@/shared/api/services/types";

export default function ViewVariant({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchVariant = async () => {
      setLoading(true);
      try {
        const res = await variantService.admin.getById(entityId);
        const data = res.data.data;
        setVariant(data);
        if (data.product_image) setImageUrl(data.product_image);
      } catch (err: unknown) {
        console.error("Error fetching variant:", err);
        setError("Failed to load variant details.");
        toast.error("Error loading variant");
      } finally {
        setLoading(false);
      }
    };
    fetchVariant();
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
          <DialogTitle className="text-center">View Variant</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-4">{error}</div>
          ) : variant ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground">
              <p>
                <strong>Variant Name:</strong> {variant.productName || "—"}
              </p>
              <p>
                <strong>Parent Product:</strong> {variant.productName || "—"}
              </p>
              <p>
                <strong>Category:</strong> {variant.categoryName || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> ₹{variant.price}
              </p>
              <p>
                <strong>Quantity:</strong> {variant.quantity}{" "}
                {variant.quantityUnit?.toUpperCase() || ""}
              </p>
              <p>
                <strong>Stock:</strong> {variant.stockQuantity}
              </p>
              <div className="flex flex-col">
                <p>
                  <strong>Rating:</strong>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(Math.round(variant.average_rating || 0))}</div>
                  <span className="text-yellow-600 font-semibold">
                    {Number(variant.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {variant.productDescription || "No description available."}
                </div>
              </div>
              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Variant Image:</p>
                  <div className="w-72 h-48 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Variant"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <DialogFooter className="justify-center border-t pt-4">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
