import { useEffect, useState } from "react";

import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { adminUserService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";

interface FormData {
  email: string;
  fullName: string;
  phone: string;
  role: string;
}

const defaultValues: FormData = { email: "", fullName: "", phone: "", role: "Admin" };

export default function AddAdmin({ open, handleOpenClose, refresh }: DialogPageProps) {
  const [formData, setFormData] = useState<FormData>({ ...defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) setFormData({ ...defaultValues });
  }, [open]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await adminUserService.admin.create({
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Admin added successfully. Password setup email sent");
        setTimeout(() => {
          handleOpenClose(false);
          refresh?.();
        }, 1000);
      } else {
        toast.error("Unexpected server response. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add user. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Add Admin User"
      onSubmit={() => onSubmit(formData)}
      submitLabel={isSubmitting ? "Adding..." : "Add User"}
      loading={isSubmitting}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Email" htmlFor="email">
          <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </FormRow>

        <FormRow label="Full Name" htmlFor="fullName">
          <Input id="fullName" value={formData.fullName || ""} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
        </FormRow>

        <FormRow label="Phone Number" htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              setFormData({ ...formData, phone: val });
            }}
          />
        </FormRow>

        <FormRow label="Role">
          <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </FormRow>
      </div>
    </FormDialog>
  );
}
