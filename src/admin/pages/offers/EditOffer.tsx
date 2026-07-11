import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { Skeleton } from "@/components/ui/skeleton";
import { offerService, categoryService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import type { DialogPageProps } from "@/admin/types";
import type { Category, Product } from "@/shared/api/services/types";

const today = new Date().toISOString().split("T")[0];

export default function EditOffer({ open, handleOpenClose, entityId, refresh }: DialogPageProps) {
  const admin = useAuth().admin;
  const [form, setForm] = useState({
    offer_name: "",
    offer_percentage: "",
    category: "",
    product: "",
    start_date: "",
    end_date: "",
    category_name: "",
    product_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !entityId) return;
    setIsLoading(true);

    Promise.all([categoryService.admin.list(), offerService.admin.getById(entityId)])
      .then(([_catRes, offerRes]) => {
        const d = offerRes.data?.data;
        setForm({
          offer_name: d.offerName || "",
          offer_percentage: String(d.offerPercentage || ""),
          category: String(d.category?.id || ""),
          product: String(d.product?.id || ""),
          start_date: d.startDate || "",
          end_date: d.endDate || "",
          category_name: d.category?.categoryName || "",
          product_name: d.product?.productName || "",
        });
      })
      .catch(() => toast.error("Error loading offer details"))
      .finally(() => setIsLoading(false));
  }, [open, entityId]);

  const validate = (): boolean => {
    if (!form.offer_name) {
      toast.error("Offer name is required");
      return false;
    }
    if (!form.offer_percentage || isNaN(Number(form.offer_percentage))) {
      toast.error("Offer percentage must be a number");
      return false;
    }
    if (!form.start_date) {
      toast.error("Start date is required");
      return false;
    }
    if (!form.end_date) {
      toast.error("End date is required");
      return false;
    }
    if (new Date(form.start_date) > new Date(form.end_date)) {
      toast.error("Start date cannot be after end date");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const isActive = form.start_date === today;
      await offerService.admin.update(entityId!, {
        offer_name: form.offer_name,
        offer_percentage: Number(form.offer_percentage),
        category: Number(form.category),
        product: Number(form.product),
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: isActive,
        updated_by: admin?.user_id,
      });

      toast.success(
        `Offer updated successfully! ${isActive ? "It's now active 🎉" : "It will activate automatically on the start date ⏰"}`
      );
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Error updating offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFutureStart = form.start_date && new Date(form.start_date) > new Date();
  const isExpired = form.end_date && new Date(form.end_date) < new Date();

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Edit Offer"
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Updating..." : "Update Offer"}
      loading={isSubmitting || isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Offer Name" htmlFor="offer_name">
            <Input
              id="offer_name"
              value={form.offer_name}
              onChange={(e) => setForm((prev) => ({ ...prev, offer_name: e.target.value }))}
            />
          </FormRow>

          <FormRow label="Offer Percentage (%)" htmlFor="offer_percentage">
            <Input
              id="offer_percentage"
              type="number"
              min={1}
              max={99}
              value={form.offer_percentage}
              onChange={(e) => {
                if (/^\d{0,2}$/.test(e.target.value)) {
                  setForm((prev) => ({ ...prev, offer_percentage: e.target.value }));
                }
              }}
            />
          </FormRow>

          <FormRow label="Start Date" htmlFor="start_date">
            <Input
              id="start_date"
              type="date"
              min={today}
              value={form.start_date}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  start_date: val,
                  end_date:
                    prev.end_date && new Date(val) > new Date(prev.end_date) ? "" : prev.end_date,
                }));
              }}
            />
          </FormRow>

          <FormRow label="End Date" htmlFor="end_date">
            <Input
              id="end_date"
              type="date"
              min={form.start_date || today}
              value={form.end_date}
              onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
            />
          </FormRow>

          <FormRow label="Category">
            <Input value={form.category_name} disabled />
          </FormRow>

          <FormRow label="Product">
            <Input value={form.product_name} disabled />
          </FormRow>

          {isFutureStart && (
            <p className="md:col-span-2 text-xs text-success">
              ⚠️ This offer starts on <span className="font-semibold">{form.start_date}</span> and
              will automatically activate on that date.
            </p>
          )}
          {isExpired && (
            <p className="md:col-span-2 text-xs text-destructive">
              ⚠️ This offer has expired on <span className="font-semibold">{form.end_date}</span>.
            </p>
          )}
        </div>
      )}
    </FormDialog>
  );
}
