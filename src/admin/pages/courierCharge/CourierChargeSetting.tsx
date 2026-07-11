import { useEffect, useState } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import { toast } from "sonner";
import { settingsService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";

import { type CourierChargeInput } from "@/shared/schemas/admin-settings";

export default function CourierSetting() {
  const [formData, setFormData] = useState<CourierChargeInput>({ courierCharge: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    settingsService
      .getCourier()
      .then((res) => setFormData({ courierCharge: Number(res.data.data?.courier_charge) }))
      .catch(() => toast.error("Failed to load courier charge"));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;
    
    setIsSubmitting(true);
    try {
      await settingsService.admin.updateCourier(data.courierCharge);
      toast.success("Courier charge updated ✅");
    } catch {
      toast.error("Failed to update courier charge");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout title="Courier Charge Settings">
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-lg p-8 rounded-2xl shadow-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courier">Courier Charge</Label>
              <Input
                id="courier"
                type="number"
                min={0}
                max={500}
                required
                value={formData.courierCharge}
                onChange={(e) => setFormData({ ...formData, courierCharge: Number(e.target.value) })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Courier Charge"}
            </Button>
          </form>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
