import type { DialogPageProps } from "@/admin/types";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { customerService } from "@/shared/api/services";
import type { Customer } from "@/shared/api/services/types";

export default function ViewCustomer({
  open,
  handleOpenClose,
  entityId: customerId,
}: DialogPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await customerService.admin.getById(customerId!);
      setCustomer(res.data.data || res.data);
    } catch (err: unknown) {
      console.error("Error fetching customer:", err);
      setError("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchCustomer();
  }, [customerId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">View Customer 👁️</DialogTitle>
        </DialogHeader>
        <div className="border-t pt-4">
          {loading ? (
            <div className="flex justify-center items-center gap-2 py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
              Loading...
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-6">{error}</div>
          ) : customer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>ID:</strong> {customer.id}
              </div>
              <div>
                <strong>Email:</strong> {customer.email}
              </div>
              <div>
                <strong>Phone:</strong> {customer.phone ?? "N/A"}
              </div>
              <div>
                <strong>Full Name:</strong> {customer.full_name ?? customer.fullName ?? "N/A"}
              </div>
              <div>
                <strong>Address:</strong> {customer.address ?? "N/A"}
              </div>
              <div>
                <strong>Date of Birth:</strong> {customer.dob ?? "N/A"}
              </div>
              <div>
                <strong>Gender:</strong> {customer.gender ?? "N/A"}
              </div>
              <div>
                <strong>Login Method:</strong> {customer.loginMethod ?? customer.login_method ?? "N/A"}
              </div>
              <div>
                <strong>Status:</strong> {(customer.isActive ?? customer.is_active) ? "Active" : "Inactive"}
              </div>
              <div>
                <strong>Google ID:</strong> {customer.googleId ?? customer.google_id ?? "N/A"}
              </div>
              <div>
                <strong>Created At:</strong> {customer.createdAt ?? customer.created_at ?? "N/A"}
              </div>
              <div>
                <strong>Updated At:</strong> {customer.updatedAt ?? customer.updated_at ?? "N/A"}
              </div>
              {customer.profile_image && (
                <div className="md:col-span-2">
                  <strong>Profile Image:</strong>
                  <div className="mt-2">
                    <img
                      src={customer.profile_image}
                      alt="Profile"
                      className="w-32 h-32 rounded-md object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <DialogFooter className="justify-center">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
