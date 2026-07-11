import React, { useEffect, useState } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ViewProduct from "./ViewProduct";
import type { Product } from "@/shared/api/services/types";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | number | null>(null);
  const [viewProductId, setViewProductId] = useState<string | number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.admin.list();
      const resData: Record<string, unknown> = response.data as unknown as Record<string, unknown>;
      const data =
        resData?.data ||
        (resData?.results as Record<string, unknown>)?.data ||
        resData?.results ||
        [];
      const cleanData = (Array.isArray(data) ? data : []).filter((item) => item && item.id);
      setProducts(cleanData);
      setFilteredProducts(cleanData);
    } catch (err: unknown) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          (p.product_name ?? p.productName)?.toLowerCase().includes(lower) ||
          (p.category_name ?? p.categoryName)?.toLowerCase().includes(lower) ||
          String(p.price).includes(lower)
      )
    );
  }, [search, products]);

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    const toastId = toast.loading("Deleting product...");
    try {
      const res = await productService.admin.delete(selectedProduct.id);
      if (res.data?.status === true || res.data?.message) {
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        toast.success(res.data?.message || "Product deleted successfully!", { id: toastId });
      } else {
        throw new Error(res.data?.message || "Failed to delete product.");
      }
    } catch (err: unknown) {
      console.error("Delete Error:", err);
      toast.dismiss(toastId);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong while deleting product.",
        { id: toastId }
      );
    }
  };

  const columns: AdminTableColumn<Product>[] = [
    {
      name: "Category Name",
      selector: (row: Product) => {
        const cat = row.category;
        if (typeof cat === 'object' && cat !== null) {
          return cat.categoryName ?? cat.category_name ?? "";
        }
        return row.category_name ?? row.categoryName ?? "";
      },
      sortable: true,
    },
    {
      name: "Product Name",
      selector: (row: Product) => row.product_name ?? row.productName ?? "",
      sortable: true,
    },
    {
      name: "Product Image",
      cell: (row: Product) => {
        const img = (row.product_image ?? row.productImage ?? row.image) as string | undefined;
        const imgSrc = img ? (img.startsWith("http") ? img : `${backendBaseUrl}${img}`) : "";
        return (
          <img
            src={imgSrc}
            alt={(row.product_name ?? row.productName ?? "Product") as string}
            className="h-10 w-10 rounded object-cover"
          />
        );
      },
    },
    {
      name: "Price",
      selector: (row: Product) => Number(row.price) || 0,
      sortable: true,
      cell: (row: Product) => <span className="font-semibold">₹{row.price}</span>,
    },
    {
      name: "Quantity",
      selector: (row: Product) => Number(row.quantity) || 0,
      sortable: true,
      cell: (row: Product) => (
        <span className="font-medium">
          {row.quantity} {row.quantity_unit ?? row.quantityUnit}
        </span>
      ),
    },
    {
      name: "Stock",
      selector: (row: Product) => Number(row.stock_quantity ?? row.stockQuantity) || 0,
      sortable: true,
      cell: (row: Product) => {
        const qty = row.stock_quantity ?? row.stockQuantity ?? 0;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${qty > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-destructive"}`}
          >
            {qty > 0 ? qty : "Out of stock"}
          </span>
        );
      },
    },
    {
      name: "Availability",
      selector: (row: Product) => (row.is_available ?? row.isActive ? "Yes" : "No"),
      sortable: true,
      cell: (row: Product) => {
        const available = row.is_available ?? row.isActive;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${available ? "bg-green-100 text-success" : "bg-red-100 text-destructive"}`}
          >
            {available ? "Available" : "Not Available"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: Product) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditProductId(row.id);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 text-admin-accent" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedProduct(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setViewProductId(row.id);
              setViewOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Product List"
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              className="pr-9"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            + Add Product
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-muted-foreground">Loading products...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredProducts}
            rowsPerPage={itemsPerPage}
            noDataMessage="No Product found."
          />
        )}
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Are you sure you want to delete{" "}
            <strong className="text-destructive">{selectedProduct?.product_name ?? selectedProduct?.productName}</strong>?
          </p>
          <DialogFooter className="justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addOpen && (
        <AddProduct open={addOpen} handleOpenClose={setAddOpen} refresh={fetchProducts} />
      )}
      {editOpen && (
        <EditProduct
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editProductId}
          entityId={editProductId}
          refresh={fetchProducts}
        />
      )}
      <ViewProduct open={viewOpen} handleOpenClose={setViewOpen} entityId={viewProductId} />
    </AdminPageLayout>
  );
}
