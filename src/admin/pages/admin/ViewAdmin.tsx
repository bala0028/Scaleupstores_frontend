import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { adminUserService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";
import type { AdminUser } from "@/shared/api/services/types";

export default function ViewAdmin({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !entityId) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await adminUserService.admin.getById(entityId);
        setUser(response.data.data);
      } catch (err: unknown) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [open, entityId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">View User</DialogTitle>
        </DialogHeader>
        <div className="border-t pt-4">
          {loading ? (
            <div className="flex justify-center py-10 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
              <span className="text-muted-foreground">Loading user...</span>
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Full Name:</p>
                <p className="text-sm">{user.full_name ?? user.fullName ?? ""}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Email:</p>
                <p className="text-sm">{user.email ?? ""}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Status:</p>
                <p className="text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${(user.isAdmin ?? user.is_admin) ? "bg-green-100 text-green-800" : "bg-red-100 text-destructive"}`}>
                    {(user.isAdmin ?? user.is_admin) ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Created At:</p>
                <p className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : (user.created_at ? new Date(user.created_at).toLocaleDateString() : "")}</p>
              </div>
            </div>
          ) : (
            <p className="text-destructive text-center py-10">User not found.</p>
          )}
        </div>
        <DialogFooter className="justify-center">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
