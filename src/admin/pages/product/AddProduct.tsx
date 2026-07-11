import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog, FileInput } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { Textarea } from "@/admin/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { productService, categoryService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import type { DialogPageProps } from "@/admin/types";
import type { Category } from "@/shared/api/services/types";

const UNITS = ["ml", "liter", "g", "kg", "piece", "pack"] as const;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
}

const emptyForm: ProductForm = {
  product_name: "",
  product_description: "",
  category: "",
  price: "",
  stock_quantity: "",
  quantity: "",
  quantity_unit: "",
  weight: "",
};

export function handleNumericInput({
  value,
  min = 1,
  max = 100,
  allowDecimal = false,
  preventZero = true,
}: {
  value: string;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  preventZero?: boolean;
}): string | null {
  let v = value;
  if (v.length > 1 && v.startsWith("0") && !v.startsWith("0.")) v = v.replace(/^0+/, "");
  if (preventZero && v === "0") return null;
  const num = Number(v);
  if (v !== "" && (isNaN(num) || num < min || num > max)) return null;
  if (!allowDecimal && v.includes(".")) return null;
  return v;
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

export default function AddProduct({ open, handleOpenClose, refresh }: DialogPageProps) {
  const admin = useAuth().admin;
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    categoryService.admin
      .list()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => {
        
      });
  }, []);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setImage(null);
      setFieldErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.product_name.trim()) errs.product_name = "Product name is required.";
    if (!form.category) errs.category = "Category is required.";
    if (!form.price || parseFloat(form.price) <= 0) errs.price = "Price must be greater than zero.";
    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0)
      errs.stock_quantity = "Stock quantity is required.";
    if (!form.quantity_unit) errs.quantity_unit = "Quantity unit is required.";
    if (!form.quantity || parseInt(form.quantity) < 0) errs.quantity = "Quantity is required.";
    if (WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) && (!form.weight || parseFloat(form.weight) <= 0)) {
      errs.weight = "Weight (KG) is required.";
    }
    if (!image) errs.product_image = "Product image is required.";
    else if (!ACCEPTED_TYPES.includes(image.type))
      errs.product_image = "Only JPEG, PNG, or WEBP images are allowed.";
    else if (image.size > 2 * 1024 * 1024) errs.product_image = "Image must be less than 2MB";

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0]);
      return false;
    }
    return true;
  };

  const updateField = (name: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      if (WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit)) {
        payload.append("weight", form.weight);
      }
      payload.append("is_available", "true");
      payload.append("created_by", String(admin?.user_id ?? ""));
      if (image) payload.append("product_image", image);

      await productService.admin.create(payload);
      toast.success("Product added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch {
      toast.error("Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Add Product"
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Adding..." : "Add Product"}
      loading={isSubmitting}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Product Name" htmlFor="product_name" error={fieldErrors.product_name}>
          <Input
            id="product_name"
            value={form.product_name}
            onChange={(e) => updateField("product_name", e.target.value)}
          />
        </FormRow>

        <FormRow label="Category" error={fieldErrors.category}>
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
        </FormRow>

        <FormRow label="Product Image">
          <FileInput
            label="Product Image"
            hideLabel
            value={image}
            onChange={setImage}
            error={fieldErrors.product_image}
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

        <FormRow label="Unit" error={fieldErrors.quantity_unit}>
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
          error={fieldErrors.quantity}
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
              const v = handleNumericInput({ value: e.target.value, ...limits, preventZero: true });
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
      </div>
    </FormDialog>
  );
}
