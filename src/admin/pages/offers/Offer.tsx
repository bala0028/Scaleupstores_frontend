import { useEffect, useState } from "react";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { offerService } from "@/shared/api/services";
import { ConfirmDialog } from "@/shared/components";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AddOffer from "./AddOffer";
import EditOffer from "./EditOffer";
import ViewOffer from "./ViewOffer";

interface OfferRow {
  id: number;
  offer_name?: string;
  offerName?: string;
  category_name?: string;
  categoryName?: string;
  product_name?: string;
  productName?: string;
  offer_percentage?: number;
  offerPercentage?: number;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  is_active?: boolean;
  isActive?: boolean;
  category?: {
    id: number;
    categoryName?: string;
    category_name?: string;
    name?: string;
    [key: string]: unknown;
  };
  product?: {
    id: number;
    productName?: string;
    product_name?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export default function Offer() {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<OfferRow | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await offerService.admin.list();
      const raw = res.data;
      // API returns: { status: true, data: [...], message: "Success" }
      const data = raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)
        ? raw.data
        : [];
      setOffers(data);
      setFilteredOffers(data);
    } catch {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredOffers(offers);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredOffers(
      offers.filter(
        (o) =>
          (o.offer_name ?? o.offerName)?.toLowerCase().includes(lower) ||
          (o.product_name ?? o.productName)?.toLowerCase().includes(lower) ||
          (o.category_name ?? o.categoryName)?.toLowerCase().includes(lower) ||
          String(o.offer_percentage ?? o.offerPercentage ?? "").includes(lower) ||
          ((o.is_active ?? o.isActive) ? "active" : "inactive").includes(lower)
      )
    );
  }, [search, offers]);

  const deleteOffer = async () => {
    if (!selected) return;
    const toastId = toast.loading("Deleting offer...");
    try {
      const res = await offerService.admin.delete(selected.id);
      if (res.data?.status === true || res.data?.message) {
        setOffers((prev) => prev.filter((o) => o.id !== selected.id));
        setDeleteOpen(false);
        setSelected(null);
        toast.success(res.data?.message || "Offer deleted!", { id: toastId });
      } else {
        throw new Error(res.data?.message || "Failed to delete offer.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.response?.data?.error || err.message || "Delete failed",
        { id: toastId }
      );
    }
  };

  const columns: AdminTableColumn<OfferRow>[] = [
    {
      name: "Category",
      selector: (row: OfferRow) => (row.category?.categoryName ?? row.category?.category_name ?? row.category?.name ?? row.category_name ?? row.categoryName ?? "") as string,
      sortable: true,
    },
    { name: "Product", selector: (row: OfferRow) => (row.product?.productName ?? row.product?.product_name ?? row.product?.name ?? row.product_name ?? row.productName ?? "") as string, sortable: true },
    { name: "Offer Name", selector: (row: OfferRow) => (row.offer_name ?? row.offerName ?? "") as string, sortable: true },
    {
      name: "Discount (%)",
      selector: (row: OfferRow) => Number(row.offer_percentage ?? row.offerPercentage) || 0,
      sortable: true,
      cell: (row: OfferRow) => (
        <span className="font-semibold text-success">{Number(row.offer_percentage ?? row.offerPercentage)}%</span>
      ),
    },
    {
      name: "Start Date",
      selector: (row: OfferRow) => row.start_date ?? row.startDate ?? "",
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row: OfferRow) => row.end_date ?? row.endDate ?? "",
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: OfferRow) => ((row.is_active ?? row.isActive) ? "Active" : "Inactive"),
      sortable: true,
      cell: (row: OfferRow) => {
        const active = row.is_active ?? row.isActive;
        return (
          <Badge
            className={
              active
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-destructive/100 text-white hover:bg-red-600"
            }
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      name: "Actions",
      cell: (row: OfferRow) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-admin-accent hover:bg-admin-accent/10 rounded"
            onClick={() => {
              setEditId(row.id);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
            onClick={() => {
              setSelected(row);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 text-muted-foreground hover:bg-muted rounded"
            onClick={() => {
              setViewId(row.id);
              setViewOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Offers List"
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>+ Add Offer</Button>
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-10 gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <span className="text-muted-foreground">Loading offers...</span>
          </div>
        ) : (
          <AdminDataTable columns={columns} data={filteredOffers} noDataMessage="No offers found." />
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteOffer}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${selected?.offer_name ?? selected?.offerName}"?`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {addOpen && <AddOffer open={addOpen} handleOpenClose={setAddOpen} refresh={fetchOffers} />}
      {editOpen && (
        <EditOffer
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editId}
          entityId={editId}
          refresh={fetchOffers}
        />
      )}
      <ViewOffer open={viewOpen} handleOpenClose={setViewOpen} entityId={viewId} />
    </AdminPageLayout>
  );
}
