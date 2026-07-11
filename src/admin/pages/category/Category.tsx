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
import { categoryService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import AddCategory from "./AddCategory";
import EditCategory from "./EditCategory";
import ViewCategory from "./ViewCategory";
import type { Category } from "@/shared/api/services/types";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | number | null>(null);
  const [viewCategoryId, setViewCategoryId] = useState<string | number | null>(null);
  const backendBaseUrl = import.meta.env.VITE_API_URL;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.admin.list();
      const data = response.data.data || [];
      setCategories(data);
      setFilteredCategories(data);
    } catch (err: unknown) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) setFilteredCategories(categories);
      else
        setFilteredCategories(
          categories.filter((c) => (c.category_name ?? c.categoryName)?.toLowerCase().includes(search.toLowerCase()))
        );
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, categories]);

  const deleteCategory = async () => {
    if (!selectedCategory) return;
    const toastId = toast.loading("Deleting category...");
    try {
      const res = await categoryService.admin.delete(selectedCategory.id);
      if (res.data?.status === true || res.status === 200) {
        toast.success(res.data?.message || "Category deleted successfully!", { id: toastId });
        setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      } else {
        throw new Error(res.data?.message || "Failed to delete category.");
      }
    } catch (err: unknown) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category.", { id: toastId });
    }
  };

  const columns: AdminTableColumn<Category>[] = [
    {
      name: "Category Name",
      selector: (row: Category) => row.category_name ?? row.categoryName ?? "",
      sortable: true,
    },
    {
      name: "Category Image",
      cell: (row: Category) => {
        const img = row.category_image ?? row.categoryImage ?? row.image;
        return (
          <img
            src={
              img
                ? img.startsWith("http")
                  ? img
                  : `${backendBaseUrl}${img}`
                : "/img/No-image.jpg"
            }
            alt={row.category_name ?? row.categoryName ?? "Category"}
            className="h-10 w-10 rounded object-cover"
          />
        );
      },
    },
    {
      name: "Actions",
      cell: (row: Category) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditCategoryId(row.id);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-5 w-5 text-admin-accent" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCategory(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setViewCategoryId(row.id);
              setViewOpen(true);
            }}
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Category List"
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Input
              className="pr-9"
              placeholder="Search category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            + Add Category
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-muted-foreground">Loading categories...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredCategories}
            noDataMessage="No categories found."
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
            <strong className="text-destructive">{selectedCategory?.category_name ?? selectedCategory?.categoryName}</strong>?
          </p>
          <DialogFooter className="justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addOpen && (
        <AddCategory open={addOpen} handleOpenClose={setAddOpen} refresh={fetchCategories} />
      )}
      {editOpen && (
        <EditCategory
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editCategoryId}
          entityId={editCategoryId}
          refresh={fetchCategories}
        />
      )}
      {viewOpen && (
        <ViewCategory open={viewOpen} handleOpenClose={setViewOpen} entityId={viewCategoryId} />
      )}
    </AdminPageLayout>
  );
}
