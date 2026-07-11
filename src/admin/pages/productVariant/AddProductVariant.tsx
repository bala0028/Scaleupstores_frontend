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
import { variantService, productService } from "@/shared/api/services";
import { useAuth } from "@/shared/contexts/AuthContext";
import { handleNumericInput } from "../product/AddProduct";
import type { DialogPageProps } from "@/admin/types";
import type { MainProductItem } from "@/shared/api/services/types";

const ALL_UNITS = ["ml", "liter", "g", "kg", "piece", "pack"] as const;
const WEIGHT_REQUIRED_UNITS = ["piece", "pack"];

function getAllowedUnits(parentUnit: string): string[] {
  switch (parentUnit) {
    case "ml":
    case "liter":
      return ["ml", "liter"];
    case "g":
    case "kg":
      return ["g", "kg"];
    case "piece":
      return ["piece"];
    case "pack":
      return ["pack"];
    default:
      return [...ALL_UNITS];
  }
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
    case "piece":
      return { min: 1, max: 1, allowDecimal: false };
    case "pack":
      return { min: 1, max: 1000, allowDecimal: false };
    default:
      return { min: 1, max: 1000, allowDecimal: false };
  }
}

interface VariantForm {
  parent: string;
  product_name: string;
  product_description: string;
  price: string;
  stock_quantity: string;
  quantity: string;
  quantity_unit: string;
  weight: string;
}

const emptyForm: VariantForm = {
  parent: "",
  product_name: "",
  product_description: "",
  price: "",
  stock_quantity: "",
  quantity: "",
  quantity_unit: "",
  weight: "",
};

export default function AddProductVariant({ open, handleOpenClose, refresh }: DialogPageProps) {
  const admin = useAuth().admin;
  const [form, setForm] = useState<VariantForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [mainProducts, setMainProducts] = useState<MainProductItem[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([...ALL_UNITS]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    productService.admin
      .mainProductList()
      .then((res) => setMainProducts(res.data?.data || []))
      .catch(() => {
        /* ignored */
      });
  }, []);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setImage(null);
      setFieldErrors({});
      setAvailableUnits([...ALL_UNITS]);
      setIsSubmitting(false);
    }
  }, [open]);

  const updateField = (name: keyof VariantForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.parent) errs.parent = "Main product is required.";
    if (!form.product_name.trim()) errs.product_name = "Variant name is required.";
    if (!form.price || parseFloat(form.price) <= 0) errs.price = "Price must be greater than zero.";
    if (!form.stock_quantity) errs.stock_quantity = "Stock quantity is required.";
    if (!form.quantity_unit) errs.quantity_unit = "Quantity unit is required.";
    if (!form.quantity) errs.quantity = "Quantity is required.";
    if (WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) && (!form.weight || parseFloat(form.weight) <= 0)) {
      errs.weight = "Weight (KG) is required.";
    }

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
      payload.append("parent", form.parent);
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("price", form.price);
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("weight", WEIGHT_REQUIRED_UNITS.includes(form.quantity_unit) ? form.weight : "");
      payload.append("is_available", "true");
      payload.append("created_by", String(admin?.user_id ?? ""));
      if (image) payload.append("product_image", image);

      await variantService.admin.create(payload);
      toast.success("Variant product added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch {
      toast.error("Failed to add variant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectParent = (parentId: string) => {
    const selected = mainProducts.find((p) => String(p.id) === parentId);
    const parentUnit = String(selected?.quantity_unit || "");
    const units = getAllowedUnits(parentUnit);
    setAvailableUnits(units);
    setForm((prev) => ({
      ...prev,
      parent: parentId,
      quantity_unit: parentUnit,
      quantity: parentUnit === "piece" ? "1" : "",
      weight: WEIGHT_REQUIRED_UNITS.includes(parentUnit) ? prev.weight : "",
    }));
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Add Product Variant"
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Adding..." : "Add Variant"}
      loading={isSubmitting}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Main Product" error={fieldErrors.parent}>
          <Select value={form.parent} onValueChange={selectParent}>
            <SelectTrigger>
              <SelectValue placeholder="Select Main Product" />
            </SelectTrigger>
            <SelectContent>
              {mainProducts.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="Variant Name" htmlFor="product_name" error={fieldErrors.product_name}>
          <Input
            id="product_name"
            value={form.product_name}
            onChange={(e) => updateField("product_name", e.target.value)}
          />
        </FormRow>

        <FormRow label="Variant Image (optional)">
          <FileInput label="Variant Image (optional)" hideLabel value={image} onChange={setImage} />
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
                quantity: v === "piece" ? "1" : prev.quantity,
                weight: WEIGHT_REQUIRED_UNITS.includes(v) ? prev.weight : "",
              }));
              if (fieldErrors.weight) setFieldErrors((prev) => ({ ...prev, weight: "" }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((u) => (
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
