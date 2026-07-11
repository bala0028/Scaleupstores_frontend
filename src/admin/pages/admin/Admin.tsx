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
import { adminUserService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import AddAdmin from "./AddAdmin";
import EditAdmin from "./EditAdmin";
import ViewAdmin from "./ViewAdmin";
import type { AdminUser } from "@/shared/api/services/types";

export default function AdminUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUserService.admin.list();
      const data = response.data.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: unknown) {
      console.error("Fetch Users Error:", err);
      toast.error("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) {
        setFilteredUsers(users);
        return;
      }
      const lower = search.toLowerCase();
      setFilteredUsers(
        users.filter((u) =>
          [(u.full_name ?? u.fullName), u.email, u.phone, u.role].some((f) => f?.toLowerCase().includes(lower))
        )
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, users]);

  const deleteUser = async () => {
    if (!selectedUser) return;
    const toastId = toast.loading("Deleting user...");
    try {
      const res = await adminUserService.admin.delete(selectedUser.id);
      if (res.data?.status === true) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        toast.success(res.data?.message || "User deleted successfully!", { id: toastId });
      } else {
        throw new Error(res.data?.message || "Failed to delete user.");
      }
    } catch (err: unknown) {
      console.error("Delete Error:", err);
      toast.dismiss(toastId);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong while deleting user.",
        { id: toastId }
      );
    }
  };

  const columns: AdminTableColumn<AdminUser>[] = [
    {
      name: "Full Name",
      selector: (row: AdminUser) => row.full_name ?? row.fullName ?? "",
      sortable: true,
    },
    { name: "Email", selector: (row: AdminUser) => row.email ?? "", sortable: true },
    {
      name: "Status",
      selector: (row: AdminUser) => (row.isAdmin ?? row.is_admin ? "Active" : "Inactive"),
      sortable: true,
      cell: (row: AdminUser) => (
        <span className={`px-2 py-1 text-xs rounded-full ${(row.isAdmin ?? row.is_admin) ? "bg-green-100 text-green-800" : "bg-red-100 text-destructive"}`}>
          {(row.isAdmin ?? row.is_admin) ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row: AdminUser) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditUserId(row.id);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-5 w-5 text-admin-accent" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedUser(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedUserId(row.id);
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
      title="Admin Users List"
      actions={
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
          <div className="relative w-full sm:w-64">
            <Input
              className="pr-9"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setAddOpen(true)}>
            + Add User
          </Button>
        </div>
      }
    >
      <AddAdmin open={addOpen} handleOpenClose={setAddOpen} refresh={fetchUsers} />

      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-muted-foreground">Loading users...</span>
          </div>
        ) : (
          <AdminDataTable columns={columns} data={filteredUsers} noDataMessage="No users found." />
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Are you sure you want to delete{" "}
            <strong className="text-destructive">{selectedUser?.full_name ?? selectedUser?.fullName}</strong>?
          </p>
          <DialogFooter className="justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editOpen && (
        <EditAdmin
          open={editOpen}
          handleOpenClose={setEditOpen}
          key={editUserId}
          entityId={editUserId}
          refresh={fetchUsers}
        />
      )}
      <ViewAdmin open={viewOpen} handleOpenClose={setViewOpen} entityId={selectedUserId} />
    </AdminPageLayout>
  );
}
