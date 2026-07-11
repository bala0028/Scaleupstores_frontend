import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog, FileInput } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { Textarea } from "@/admin/components/ui/Textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { productService, categoryService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import { handleNumericInput } from "./AddProduct";
import type { DialogPageProps } from "@/admin/types";
import type { Category } from "@/shared/api/services/types";

const UNITS = ["ml", "liter", "g", "kg", "piece", "pack"] as const;
const WEIGHT_REQUIRED_UNITS = ["piece", "pack"];

interface ProductForm {
  product_name: string;
  product_description: string;
  category: string;
  price: string;
  stock_quantity: string;
  quantity: string;
  quantity_unit: string;
  weight: string;
  is_available: boolean;
}

function getQuantityLimits(unit: string) {
  switch (unit) {
    case "ml":
      return { min: 1, max: 999, allowDecimal: false };
    case "liter":
      return { min: 1, max: 99.99, allowDecimal: true };
    case "g":
      return { min: 1, max: 999, allowDecimal: false };
    case "kg":
      return { min: 1, max: 99.99, allowDecimal: true };
    case "pack":
      return { min: 1, max: 1000, allowDecimal: false };
    default:
      return { min: 1, max: 1000, allowDecimal: false };
  }
}

export default function EditProduct({ open, handleOpenClose, entityId, refresh }: DialogPageProps) {
  const admin = useAuth().admin;
  const [form, setForm] = useState<ProductForm>({
    product_name: "",
    product_description: "",
    category: "",
    price: "",
    stock_quantity: "",
    quantity: "",
    quantity_unit: "",
    weight: "",
    is_available: false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !entityId) return;
    setIsLoading(true);

    Promise.all([productService.admin.getById(entityId), categoryService.admin.list()])
      .then(([prodRes, catRes]) => {
        const d = prodRes.data.data;
        setForm({
          product_name: d.productName || "",
          product_description: d.productDescription || "",
          category: String(d.category || ""),
          price: String(d.price || ""),
          stock_quantity: String(d.stockQuantity || ""),
          quantity: String(d.quantity || ""),
          quantity_unit: d.quantityUnit || "",
          weight: String(d.weight || ""),
          is_available: Boolean(d.isActive),
        });
        setExistingImage((d.image as string) || null);
        setExistingFileName((d.image as string)?.split("/").pop() || "");
        setImage(null);
        setCategories(catRes.data.data || []);
      })
      .catch(() => toast.error("Error loading product details"))
      .finally(() => setIsLoading(false));
  }, [entityId, open]);

  const updateField = (name: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.product_name.trim()) errs.product_name = "Product name is required.";
    if (!form.category) errs.category = "Category is required.";
    if (!form.price || parseFloat(form.price) <= 0) errs.price = "Price must be greater than zero.";
    if (!form.quantity_unit) errs.quantity_unit = "Quantity unit is required.";
    if (!form.quantity) errs.quantity = "Quantity is required.";
    if (WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) && (!form.weight || parseFloat(form.weight) <= 0)) {
      errs.weight = "Weight (KG) is required.";
    }
    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0)
      errs.stock_quantity = "Stock quantity is required.";

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("weight", WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) ? form.weight : "");
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("is_available", String(form.is_available));
      payload.append("updated_by", String(admin?.user_id ?? ""));
      if (image) payload.append("product_image", image);

      const res = await productService.admin.update(entityId!, payload);
      toast.success(res.data?.message || "Product updated successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch {
      toast.error("Error updating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Edit Product"
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Updating..." : "Update Product"}
      loading={isSubmitting || isLoading}
      size="lg"
    >
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Product Name" htmlFor="product_name" error={fieldErrors.product_name}>
            <Input
              id="product_name"
              value={form.product_name}
              onChange={(e) => updateField("product_name", e.target.value)}
            />
          </FormRow>

          <FormRow label="Category">
            <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.category && (
              <p className="text-xs text-muted-foreground">
                Current: {categories.find((c) => String(c.id) === form.category)?.categoryName ?? "Unknown"}
              </p>
            )}
          </FormRow>

          <FormRow label="Product Image">
            <FileInput
              label="Product Image"
              hideLabel
              value={image}
              onChange={(file: File | null) => {
                setImage(file);
                if (!file) {
                  setExistingImage(null);
                  setExistingFileName("");
                }
              }}
              existingFileName={existingFileName}
            />
          </FormRow>

          <FormRow label="Price" htmlFor="price" error={fieldErrors.price}>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => {
                const v = handleNumericInput({ value: e.target.value, min: 1, max: 10000 });
                if (v !== null) updateField("price", v);
              }}
            />
          </FormRow>

          <FormRow label="Unit">
            <Select
              value={form.quantity_unit}
              onValueChange={(v) => {
                setForm((prev) => ({
                  ...prev,
                  quantity_unit: v,
                  quantity: v === "piece" ? "1" : "",
                  weight: WEIGHT_REQUIRED_UNITS.includes(v) ? prev.weight : "",
                }));
                if (fieldErrors.weight) setFieldErrors((prev) => ({ ...prev, weight: "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow
            label={`Quantity${form.quantity_unit ? ` (${form.quantity_unit.toUpperCase()})` : ""}`}
            htmlFor="quantity"
          >
            <Input
              id="quantity"
              type="number"
              value={form.quantity}
              disabled={!form.quantity_unit}
              readOnly={form.quantity_unit === "piece"}
              className={form.quantity_unit === "piece" ? "cursor-not-allowed bg-muted" : ""}
              onChange={(e) => {
                const limits = getQuantityLimits(form.quantity_unit);
                const v = handleNumericInput({
                  value: e.target.value,
                  ...limits,
                  preventZero: true,
                });
                if (v !== null) updateField("quantity", v);
              }}
            />
          </FormRow>

          {WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) && (
            <FormRow label="Weight of single product (KG)" htmlFor="weight" error={fieldErrors.weight}>
              <Input
                id="weight"
                type="number"
                value={form.weight}
                onChange={(e) => {
                  const v = handleNumericInput({ value: e.target.value, min: 0.01, max: 99.99, allowDecimal: true });
                  if (v !== null) updateField("weight", v);
                }}
              />
            </FormRow>
          )}

          <FormRow label="Stock Quantity" htmlFor="stock_quantity" error={fieldErrors.stock_quantity}>
            <Input
              id="stock_quantity"
              type="number"
              value={form.stock_quantity}
              onChange={(e) => {
                const v = handleNumericInput({ value: e.target.value, min: 1, max: 100 });
                if (v !== null) updateField("stock_quantity", v);
              }}
            />
          </FormRow>

          <FormRow label="Description" htmlFor="product_description" className="md:col-span-2">
            <Textarea
              id="product_description"
              rows={4}
              maxLength={3000}
              value={form.product_description}
              onChange={(e) => updateField("product_description", e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.product_description.length}/3000
            </p>
          </FormRow>

          {existingImage && !image && (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">Current Image:</p>
              <div className="w-72 h-48 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                <img
                  src={existingImage}
                  alt="Product"
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
