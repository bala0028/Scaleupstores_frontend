import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { reviewService } from "@/shared/api/services";
import { Star } from "lucide-react";
import type { DialogPageProps } from "@/admin/types";
import { normalizeReview, type NormalizedReview } from "./reviewUtils";

export default function ViewReview({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [review, setReview] = useState<NormalizedReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchReview = async () => {
      setLoading(true);
      try {
        const res = await reviewService.admin.detail(entityId);
        setReview(normalizeReview(res.data.data));
      } catch (err: unknown) {
        console.error("Error loading review", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [open, entityId]);

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "text-yellow-500" : "text-muted-foreground"}`}
      />
    ));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">Review Details</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            </div>
          ) : review ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground">
              <div>
                <p className="font-semibold text-sm text-foreground">Product</p>
                <p className="mt-1">{review.product_name}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Reviewer</p>
                <p className="mt-1">{review.user_name}</p>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating ?? 0)}
                  <span className="text-yellow-700 font-semibold">{review.rating}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Status</p>
                <p className="mt-1">
                  {review.is_approved ? (
                    <span className="text-success font-medium">Approved</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Pending</span>
                  )}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Comment:</p>
                <div
                  className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto break-words"
                >
                  {review.comment || "No comment available"}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-sm text-foreground">Date</p>
                <p className="mt-1">
                  {review.created_at ? new Date(review.created_at).toLocaleString() : "—"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter className="justify-center">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
