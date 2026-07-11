import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { reviewService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";
import { normalizeReview, type NormalizedReview } from "./reviewUtils";

interface ReviewData extends NormalizedReview {
  action?: string;
}

export default function UpdateReviewStatus({
  entityId,
  open,
  handleOpenClose,
  refresh,
}: DialogPageProps) {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!open || !entityId) return;
    setLoading(true);
    reviewService.admin
      .detail(entityId)
      .then((res) => setReview(normalizeReview(res.data.data)))
      .catch(() => toast.error("Failed to load review"))
      .finally(() => setLoading(false));
  }, [open, entityId]);

  const onSubmit = async () => {
    if (!review?.action) {
      toast.error("Please select Approved / Rejected");
      return;
    }
    setUpdating(true);
    try {
      await reviewService.admin.approve(entityId!, { action: review.action });
      toast.success("Review status updated");
      refresh?.();
      handleOpenClose(false);
    } catch {
      toast.error("Failed to update review");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Update Review Status"
      onSubmit={onSubmit}
      submitLabel={updating ? "Updating..." : "Update"}
      loading={updating || loading}
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : review ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Product:</strong> {review.product_name}
            </div>
            <div>
              <strong>Reviewer:</strong> {review.user_name}
            </div>
            <div>
              <strong>Rating:</strong> {review.rating} ⭐
            </div>
            <div>
              <strong>Status:</strong> {review.is_approved ? "Approved" : "Pending"}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2 text-sm">Comment:</p>
            <div
              className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto break-words"
            >
              {review.comment || "No comment available"}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-64">
              <Select
                value={review.action || ""}
                onValueChange={(v) => setReview({ ...review, action: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approved</SelectItem>
                  <SelectItem value="reject">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}
    </FormDialog>
  );
}
