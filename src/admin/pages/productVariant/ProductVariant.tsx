import React, { useEffect, useState, useCallback } from "react";
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
import { variantService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import AddProductVariant from "./AddProductVariant";
import EditVariant from "./EditProductVariant";
import ViewVariant from "./ViewProductVariant";
import type { Variant } from "@/shared/api/services/types";

export default function ProductVariant() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | number | null>(null);
  const [viewProductId, setViewProductId] = useState<string | number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalVariants, setTotalVariants] = useState(0);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const fetchVariants = useCallback(
    async (pageNumber = page, pageSize = itemsPerPage) => {
      setLoading(true);
      try {
        const res = await variantService.admin.list({ page: pageNumber, page_size: pageSize });
        const resData = res.data;
        const data =
          resData &&
          typeof resData === "object" &&
          "results" in resData &&
          resData.results &&
          typeof resData.results === "object" &&
          "data" in resData.results &&
          Array.isArray(resData.results.data)
            ? resData.results.data
            : resData &&
                typeof resData === "object" &&
                "data" in resData &&
                resData.data &&
                typeof resData.data === "object" &&
                "data" in resData.data &&
                Array.isArray(resData.data.data)
              ? resData.data.data
              : resData &&
                  typeof resData === "object" &&
                  "data" in resData &&
                  Array.isArray(resData.data)
                ? resData.data
                : [];
        setVariants(data);
        setTotalVariants(
          resData &&
            typeof resData === "object" &&
            "count" in resData &&
            typeof resData.count === "number"
            ? resData.count
            : data.length
        );
      } catch {
        toast.error("Failed to load variants");
      } finally {
        setLoading(false);
      }
    },
    [page, itemsPerPage]
  );

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const filtered = variants.filter(
    (v) =>
      v.productName?.toLowerCase().includes(search.toLowerCase()) ||
      v.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteVariant = async () => {
    if (!selectedVariant) return;
    const toastId = toast.loading("Deleting variant...");
    try {
      await variantService.admin.delete(selectedVariant.id);
      toast.success("Variant deleted successfully!", { id: toastId });
      setVariants((prev) => prev.filter((v) => v.id !== selectedVariant.id));
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete variant", { id: toastId });
    }
  };

  const columns: AdminTableColumn<Variant>[] = [
    { name: "Parent Product", selector: (row: Variant) => {
        const parent = row.parent;
        if (typeof parent === 'object' && parent !== null) {
          return parent.productName ?? parent.product_name ?? "—";
        }
        return "—";
      } },
    { name: "Variant Name", selector: (row: Variant) => row.productName ?? row.product_name ?? "" },
    {
      name: "Image",
      cell: (row: Variant) => {
        const img = row.productImage ?? row.product_image ?? row.image;
        const imgSrc = img ? (img.startsWith("http") ? img : `${backendBaseUrl}${img}`) : "";
        return (
          <img
            src={imgSrc}
            alt={row.productName ?? row.product_name ?? "Variant"}
            className="h-10 w-10 rounded object-cover"
          />
        );
      },
    },
    {
      name: "Price",
      selector: (row: Variant) => Number(row.price) || 0,
      sortable: true,
      cell: (row: Variant) => <span className="font-semibold">₹{row.price}</span>,
    },
    {
      name: "Quantity",
      selector: (row: Variant) => Number(row.quantity) || 0,
      sortable: true,
      cell: (row: Variant) => (
        <span className="font-medium">
          {row.quantity} {row.quantityUnit ?? row.quantity_unit}
        </span>
      ),
    },
    {
      name: "Stock",
      selector: (row: Variant) => Number(row.stockQuantity ?? row.stock_quantity) || 0,
      sortable: true,
      cell: (row: Variant) => {
        const qty = row.stockQuantity ?? row.stock_quantity ?? 0;
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
      selector: (row: Variant) => (row.isActive ?? row.is_available ? "Yes" : "No"),
      sortable: true,
      cell: (row: Variant) => {
        const avail = row.isActive ?? row.is_available;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${avail ? "bg-green-100 text-success" : "bg-red-100 text-destructive"}`}
          >
            {avail ? "Available" : "Not Available"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: Variant) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
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
            onClick={() => {
              setSelectedVariant(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
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
      title="Variant Products"
      actions={
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-64">
            <Input
              className="pr-9"
              placeholder="Search variants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            + Add Variant
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-10 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span>Loading variants...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filtered}
            serverSide
            page={page}
            totalRows={totalVariants}
            rowsPerPage={itemsPerPage}
            onPageChange={setPage}
            noDataMessage="No variants found."
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
            <strong className="text-destructive">{selectedVariant?.productName ?? selectedVariant?.product_name}</strong>?
          </p>
          <DialogFooter className="justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteVariant}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addOpen && (
        <AddProductVariant open={addOpen} handleOpenClose={setAddOpen} refresh={fetchVariants} />
      )}
      {editOpen && (
        <EditVariant
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editProductId}
          entityId={editProductId}
          refresh={fetchVariants}
        />
      )}
      <ViewVariant open={viewOpen} handleOpenClose={setViewOpen} entityId={viewProductId} />
    </AdminPageLayout>
  );
}
