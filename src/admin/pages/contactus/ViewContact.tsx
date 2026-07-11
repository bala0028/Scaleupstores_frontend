import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/admin/components/ui/Button";
import { contactService } from "@/shared/api/services";
import type { DialogPageProps } from "@/admin/types";
import type { Contact } from "@/shared/api/services/types";

export default function ViewContact({ open, handleOpenClose, entityId }: DialogPageProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await contactService.admin.getById(entityId!);
      setContact(res.data.data);
    } catch (err: unknown) {
      console.error("Error fetching contact:", err);
      alert("Failed to fetch contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && entityId!) fetchContact();
  }, [open, entityId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleOpenClose(false)}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-center">View Contact 👁️</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
          {loading ? (
            <div className="flex justify-center items-center gap-2 py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-blue-600" />
              Loading...
            </div>
          ) : contact ? (
            <div className="space-y-4 text-foreground">
              <p>
                <strong>Name:</strong> {contact.name || "—"}
              </p>
              <p>
                <strong>Email:</strong> {contact.email || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {contact.phone || "—"}
              </p>
              <div>
                <p className="font-medium mb-2">Message:</p>
                <div className="border rounded-lg bg-muted p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {contact.message || "No message provided."}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-destructive py-6">No contact found.</div>
          )}
        </div>
        <DialogFooter className="justify-center border-t pt-3">
          <Button variant="outline" onClick={() => handleOpenClose(false)}>
            Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
