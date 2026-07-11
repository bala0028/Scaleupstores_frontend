import { Card, CardContent } from "@/admin/components/ui/Card";
import { Button } from "@/admin/components/ui/Button";
import { useAuth } from "@/shared/contexts/AuthContext";

interface ProfileModalProps {
  open: boolean;
  handleClose: () => void;
}

export default function ProfileModal({ open, handleClose }: ProfileModalProps) {
  const admin = useAuth().admin as Record<string, string> | null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 pt-6">
          <h5 className="text-xl font-bold text-center">Profile Details</h5>
          {admin ? (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {admin.full_name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {admin.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {admin.phone || "-"}
              </p>
              <p>
                <strong>Role:</strong> {admin.role || "-"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-destructive">No admin data found.</p>
          )}
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
