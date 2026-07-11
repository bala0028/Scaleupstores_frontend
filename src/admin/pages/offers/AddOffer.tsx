import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components";
import { Input } from "@/admin/components/ui/Input";
import { FormRow } from "@/admin/components/ui/FormRow";
import { offerService, categoryService } from "@/shared/api/services";
import { MultiSelect } from "./MultiSelect";
import type { DialogPageProps } from "@/admin/types";
import type { Category } from "@/shared/api/services/types";

interface ProductOption {
  id: number;
  product_name: string;
  categoryId: number | null;
}

interface OfferForm {
  category: string[];
  product: string[];
  offer_name: string;
  offer_percentage: string;
  start_date: string;
  end_date: string;
}

const emptyForm: OfferForm = {
  category: [],
  product: [],
  offer_name: "",
  offer_percentage: "",
  start_date: "",
  end_date: "",
};

const today = new Date().toISOString().split("T")[0];

export default function AddOffer({ open, handleOpenClose, refresh }: DialogPageProps) {
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setProducts([]);
      setCategoryDropdownOpen(false);
      setProductDropdownOpen(false);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    categoryService.admin
      .list()
      .then((res) => setCategories(res.data?.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  // Fetch products for whichever categories are selected — merges results
  // across categories so a product can't appear twice.
  useEffect(() => {
    if (!form.category.length) {
      setProducts([]);
      setForm((prev) => ({ ...prev, product: [] }));
      return;
    }

    const allCategoriesSelected = categories.length > 0 && form.category.length === categories.length;

    const load = async () => {
      try {
        let items: any[] = [];
        if (allCategoriesSelected) {
          const res = await offerService.admin.allProducts();
          const { status, message, data } = res.data || {};
          if (status === false || !data?.length) {
            toast.error(message || "No products found.");
          }
          items = data || [];
        } else {
          const responses = await Promise.all(
            form.category.map((catId) => offerService.admin.byCategory(catId))
          );
          const merged = new Map<number, any>();
          responses.forEach((res) => {
            (res.data?.data || []).forEach((p: any) => merged.set(p.id, p));
          });
          items = Array.from(merged.values());
          if (!items.length) {
            toast.error("No products found for the selected categories.");
          }
        }

        setProducts(
          items.map((p: any) => ({
            id: p.id,
            product_name: p.productName ?? p.product_name,
            categoryId: p.categoryId ?? p.category?.id ?? null,
          }))
        );
        setForm((prev) => ({ ...prev, product: [] }));
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch products");
        setProducts([]);
        setForm((prev) => ({ ...prev, product: [] }));
      }
    };

    load();
  }, [form.category, categories.length]);

  const validate = (): boolean => {
    if (!form.category.length) {
      toast.error("Category is required");
      return false;
    }
    if (!form.product.length) {
      toast.error("Product is required");
      return false;
    }
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
      const productMap = new Map(products.map((p) => [String(p.id), p]));

      const payload = form.product.map((prodId) => ({
        productId: Number(prodId),
        categoryId: productMap.get(prodId)?.categoryId ?? null,
        offerName: form.offer_name,
        offerPercentage: Number(form.offer_percentage),
        startDate: form.start_date,
        endDate: form.end_date,
        isActive,
      }));

      await offerService.admin.create(payload);
      toast.success("Offer(s) added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Failed to add offer(s)");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(id)
        ? prev.category.filter((c) => c !== id)
        : [...prev.category, id],
    }));
  };

  const toggleAllCategories = () => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.length === categories.length ? [] : categories.map((c) => String(c.id)),
    }));
  };

  const toggleProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      product: prev.product.includes(id)
        ? prev.product.filter((p) => p !== id)
        : [...prev.product, id],
    }));
  };

  const toggleAllProducts = () => {
    setForm((prev) => ({
      ...prev,
      product: prev.product.length === products.length ? [] : products.map((p) => String(p.id)),
    }));
  };

  const isFutureStart = form.start_date && new Date(form.start_date) > new Date();

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenClose}
      title="Add Offer"
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Adding..." : "Add Offer"}
      loading={isSubmitting}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Category">
          <MultiSelect
            label="Category"
            placeholder="Select Category"
            selectAllLabel="Select All Categories"
            options={categories.map((c) => ({ id: c.id, name: c.categoryName || c.category_name || c.name }))}
            selected={form.category}
            hideLabel
            dropdownOpen={categoryDropdownOpen}
            setDropdownOpen={setCategoryDropdownOpen}
            toggleOption={toggleCategory}
            toggleAll={toggleAllCategories}
          />
        </FormRow>

        <FormRow label="Product">
          <MultiSelect
            label="Product"
            placeholder="Select Product"
            selectAllLabel="Select All Products"
            options={products.map((p) => ({ id: p.id, name: p.product_name }))}
            selected={form.product}
            disabled={!form.category.length}
            hideLabel
            dropdownOpen={productDropdownOpen}
            setDropdownOpen={setProductDropdownOpen}
            toggleOption={toggleProduct}
            toggleAll={toggleAllProducts}
          />
        </FormRow>

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
            max={100}
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
      </div>

      {isFutureStart && (
        <p className="text-xs text-success mt-3">
          ⚠️ This offer starts on <span className="font-semibold">{form.start_date}</span> and will
          automatically activate on that date.
        </p>
      )}
    </FormDialog>
  );
}
