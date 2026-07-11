import { useEffect, useState } from "react";
import { Trash2, Eye, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { reviewService, categoryService, productService } from "@/shared/api/services";
import { ConfirmDialog } from "@/shared/components";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/Select";
import { Skeleton } from "@/components/ui/skeleton";
import ViewReview from "./viewReview";
import UpdateReviewStatus from "./UpdateReview";
import { normalizeReview, type NormalizedReview } from "./reviewUtils";

type ReviewRow = NormalizedReview;

export default function Review() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [mainProducts, setMainProducts] = useState<any[]>([]);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [ordering, setOrdering] = useState("-created_at");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.admin.list();
      setCategories(res.data?.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchMainProducts = async () => {
    try {
      const res = await productService.admin.mainProductList();
      if (res.data && typeof res.data === "object" && "status" in res.data && res.data.status) {
        setMainProducts(res.data.data);
      }
    } catch {
      toast.error("Failed to load main products");
    }
  };

  const fetchReviews = async (pageNumber = page, pageSize = perPage, order = ordering) => {
    setLoading(true);
    try {
      const res = await reviewService.admin.list({
        category_id: filterCategory || undefined,
        product_id: filterProduct || undefined,
        rating: filterRating || undefined,
        ordering: order,
        page: pageNumber,
        page_size: pageSize,
      });
      const data = res.data?.data;
      setReviews(Array.isArray(data?.feedbacks) ? data.feedbacks.map(normalizeReview) : []);
      setTotalRows(typeof data?.total === "number" ? data.total : 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMainProducts();
  }, []);
  useEffect(() => {
    fetchReviews(page, perPage, ordering);
  }, [page, perPage, filterCategory, filterProduct, filterRating, ordering]);

  const filteredReviews = reviews.filter((r) =>
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteReview = async () => {
    if (!deleteTarget) return;
    const toastId = toast.loading("Deleting review...");
    try {
      await reviewService.admin.delete(deleteTarget.id);
      toast.success("Review deleted!", { id: toastId });
      setDeleteOpen(false);
      fetchReviews(page, perPage, ordering);
    } catch {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const columns: AdminTableColumn<ReviewRow>[] = [
    {
      name: "Product",
      selector: (row: ReviewRow) => row.product_name,
      sortable: true,
      sortField: "product_name",
    },
    {
      name: "User",
      selector: (row: ReviewRow) => row.user_name,
      sortable: true,
      sortField: "user_name",
    },
    { name: "Rating", selector: (row: ReviewRow) => row.rating, sortable: true, sortField: "rating" },
    {
      name: "Comment",
      selector: (row: ReviewRow) => row.comment,
      cell: (row: ReviewRow) =>
        row.comment?.length > 20 ? row.comment.substring(0, 20) + "..." : row.comment,
    },
    {
      name: "Status",
      selector: (row: ReviewRow) => (row.is_approved ? "Approved" : "Pending"),
      sortable: true,
      sortField: "is_approved",
      cell: (row: ReviewRow) =>
        row.is_approved ? (
          <span className="text-success">Approved</span>
        ) : (
          <span className="text-orange-600">Pending</span>
        ),
    },
    {
      name: "Actions",
      cell: (row: ReviewRow) => (
        <div className="flex gap-1">
          <button
            className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
            onClick={() => {
              setDeleteTarget(row);
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 text-muted-foreground hover:bg-muted rounded"
            onClick={() => {
              setSelectedReviewId(row.id);
              setViewOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 text-admin-accent hover:bg-admin-accent/10 rounded"
            onClick={() => {
              setSelectedReviewId(row.id);
              setEditOpen(true);
            }}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleServerSort = (field: string, direction: "asc" | "desc") => {
    setOrdering(direction === "asc" ? field : `-${field}`);
  };

  const hasActiveFilters = Boolean(filterCategory || filterProduct || filterRating || search);

  const clearFilters = () => {
    setFilterCategory("");
    setFilterProduct("");
    setFilterRating("");
    setSearch("");
    setPage(1);
  };

  return (
    <AdminPageLayout
      title="Product Review Details"
      description="Moderate and manage customer reviews for your products"
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="w-full sm:w-48">
          <Select
            value={filterCategory}
            onValueChange={(val) => {
              setFilterCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.category_name ?? c.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={filterProduct}
            onValueChange={(val) => {
              setFilterProduct(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Products</SelectItem>
              {mainProducts.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.product_name ?? p.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-40">
          <Select
            value={filterRating}
            onValueChange={(val) => {
              setFilterRating(val);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} Star
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredReviews}
            serverSide
            page={page}
            onPageChange={setPage}
            totalRows={totalRows}
            rowsPerPage={perPage}
            onServerSort={handleServerSort}
            noDataMessage="No reviews found."
          />
        )}
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={deleteReview}
        title="Confirm Delete"
        description="Are you sure you want to delete this review?"
        confirmLabel="Delete"
        variant="destructive"
      />
      <ViewReview open={viewOpen} handleOpenClose={setViewOpen} entityId={selectedReviewId} />
      <UpdateReviewStatus
        open={editOpen}
        handleOpenClose={setEditOpen}
        entityId={selectedReviewId}
      />
    </AdminPageLayout>
  );
}
