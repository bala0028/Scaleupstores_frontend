import { useEffect, useState } from "react";

import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { Skeleton } from "@/components/ui/skeleton";
import { adminUserService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";

interface FormData {
  full_name: string;
  email: string;
}

const defaultValues: FormData = { full_name: "", email: "" };

export default function EditAdmin({
  open,
  handleOpenClose,
  entityId: userId,
  refresh,
}: DialogPageProps) {
  const [formData, setFormData] = useState<FormData>({ ...defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setIsLoading(true);
    adminUserService.admin
      .getById(userId)
      .then((res) => {
        const user = res.data.data;
        setFormData({
          full_name: user.full_name ?? user.fullName ?? "",
          email: user.email ?? "",
        });
      })
      .catch(() => toast.error("Error loading user."))
      .finally(() => setIsLoading(false));
  }, [userId, open]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await adminUserService.admin.update(userId!, data as any);
      toast.success(res.data?.message || "User updated successfully!");
      setTimeout(() => handleOpenClose(false), 1500);
      refresh?.();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const errorMessage = error.response?.data?.message || error.response?.data?.errors;

      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else if (typeof errorMessage === "object" && errorMessage) {
        const firstError = Object.values(errorMessage)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Edit User"
      onSubmit={() => onSubmit(formData)}
      submitLabel={isSubmitting ? "Updating..." : "Update User"}
      loading={isSubmitting || isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Full Name" htmlFor="full_name">
            <Input id="full_name" value={formData.full_name || ""} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          </FormRow>

          <FormRow label="Email" htmlFor="email">
            <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </FormRow>
        </div>
      )}
    </FormDialog>
  );
}
