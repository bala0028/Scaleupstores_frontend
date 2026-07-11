import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { offerService } from "@/shared/api/services";
import { toast } from "sonner";
import type { DialogPageProps } from "@/admin/types";
import type { Offer } from "@/shared/api/services/types";

export default function ViewOffer({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await offerService.admin.getById(entityId);
        setOffer(res.data.data);
      } catch (err: unknown) {
        console.error("Error fetching offer:", err);
        setError("Failed to load offer details.");
        toast.error("Error loading offer");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [entityId, open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">View Offer</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-4">{error}</div>
          ) : offer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <strong>Offer Name:</strong> {offer.offerName}
              </p>
              <p>
                <strong>Category:</strong> {offer.category?.categoryName || "—"}
              </p>
              <p>
                <strong>Product:</strong> {offer.product?.productName || "—"}
              </p>
              <p>
                <strong>Offer Percentage:</strong> {offer.offerPercentage}%
              </p>
              {offer.startDate && (
                <p>
                  <strong>Start Date:</strong> {new Date(offer.startDate).toLocaleString()}
                </p>
              )}
              {offer.endDate && (
                <p>
                  <strong>End Date:</strong> {new Date(offer.endDate).toLocaleString()}
                </p>
              )}
              <p className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge variant={offer.isActive ? "default" : "destructive"}>
                  {offer.isActive ? "Active" : "Inactive"}
                </Badge>
              </p>
              {offer.createdAt && (
                <p>
                  <strong>Created On:</strong> {new Date(offer.createdAt).toLocaleString()}
                </p>
              )}
              {offer.offerImage && (
                <div className="md:col-span-2">
                  <p>
                    <strong>Offer Image:</strong>
                  </p>
                  <img
                    src={offer.offer_image?.startsWith("http") ? offer.offer_image : `${import.meta.env.VITE_API_URL}${offer.offer_image}`}
                    alt="Offer"
                    className="w-full max-w-xs h-auto object-contain rounded-md border mt-2"
                  />
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
