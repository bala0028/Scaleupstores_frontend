import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { categoryService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";
import type { Category } from "@/shared/api/services/types";

export default function ViewCategory({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await categoryService.admin.getById(entityId);
        setCategory(res.data.data);
        // Backend returns 'image' field, not 'category_image'
        if (res.data?.data?.image) setImageUrl(res.data.data.image);
      } catch (err: unknown) {
        console.error("Error fetching category:", err);
        setError("Failed to load category details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [entityId, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">View Category</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-4">{error}</div>
          ) : category ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p>
                <strong>Category Name:</strong>{" "}
                <span className="text-foreground">{category.categoryName ?? category.category_name ?? ""}</span>
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                <span className="text-foreground">{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : (category.created_at ? new Date(category.created_at).toLocaleDateString() : "")}</span>
              </p>
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {category.description || "No description available."}
                </div>
              </div>
              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Category Image:</p>
                  <div className="w-72 h-48 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Category"
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
