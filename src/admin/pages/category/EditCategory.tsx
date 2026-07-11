import { useEffect, useState } from "react";

import { toast } from "sonner";
import { FormDialog, FileInput } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { Textarea } from "@/admin/components/ui/Textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import type { DialogPageProps } from "@/admin/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

interface FormData {
  category_name: string;
  description: string;
}

export default function EditCategory({
  open,
  handleOpenClose,
  entityId,
  refresh,
}: DialogPageProps) {
  const [formData, setFormData] = useState<FormData>({ category_name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const admin = useAuth().admin;
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !entityId) return;
    setIsLoading(true);
    categoryService.admin
      .getById(entityId)
      .then((res) => {
        const data = res.data.data;
        // Backend returns categoryName and image (camelCase)
        setFormData({ category_name: data.categoryName ?? data.category_name ?? "", description: data.description || "" });
        setExistingImage(data.image || data.category_image || null);
        setExistingFileName((data.image || data.category_image || "").split("/").pop() || "");
        setImage(null);
      })
      .catch(() => toast.error("Error loading category"))
      .finally(() => setIsLoading(false));
  }, [entityId, open]);

  const validateImage = (): boolean => {
    if (!image && !existingImage) {
      toast.error("Category image is required");
      return false;
    }
    if (image && !ACCEPTED_TYPES.includes(image.type)) {
      toast.error("Only JPEG, PNG or WEBP images are allowed");
      return false;
    }
    if (image && image.size > MAX_SIZE) {
      toast.error("Image must be less than 2MB");
      return false;
    }
    return true;
  };

  const onSubmit = async (data: FormData) => {
    if (!validateImage()) return;

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("category_name", data.category_name);
    payload.append("description", data.description || "");
    payload.append("updated_by", String(admin?.user_id ?? ""));
    if (image) payload.append("category_image", image);

    try {
      const res = await categoryService.admin.update(entityId!, payload);
      toast.success(res.data?.message || "Category updated successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const msg = error.response?.data?.message || error.response?.data?.errors;
      if (typeof msg === "string") toast.error(msg);
      else if (typeof msg === "object" && msg) {
        const first = Object.values(msg)[0];
        toast.error(Array.isArray(first) ? first[0] : String(first));
      } else toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const descLength = formData.description?.length || 0;

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Edit Category"
      onSubmit={() => onSubmit(formData)}
      submitLabel={isSubmitting ? "Updating..." : "Update Category"}
      loading={isSubmitting || isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Category Name" htmlFor="category_name">
            <Input id="category_name" value={formData.category_name || ""} onChange={(e) => setFormData({ ...formData, category_name: e.target.value })} />
          </FormRow>

          <FormRow label="Category Image">
            <FileInput
              label="Category Image"
              hideLabel
              value={image}
              onChange={(file) => {
                setImage(file);
                if (!file) {
                  setExistingImage(null);
                  setExistingFileName("");
                }
              }}
              existingFileName={existingFileName}
            />
          </FormRow>

          <FormRow label="Description" htmlFor="description" className="md:col-span-2">
            <Textarea id="description" rows={4} maxLength={3000} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <p className="text-xs text-muted-foreground text-right">{descLength}/3000</p>
          </FormRow>

          {existingImage && !image && (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Current Image:</p>
              <div className="w-72 h-48 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                <img
                  src={existingImage}
                  alt="Category"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </FormDialog>
  );
}
