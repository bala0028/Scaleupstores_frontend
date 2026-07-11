import { useEffect, useState } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import { toast } from "sonner";
import { settingsService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";

import { type GstInput } from "@/shared/schemas/admin-settings";

export default function GSTSetting() {
  const [formData, setFormData] = useState<GstInput>({ gst: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    settingsService
      .getGst()
      .then((res) => setFormData({ gst: Number(res.data.data?.gst_percentage) }))
      .catch(() => toast.error("Failed to load GST value"));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = formData;

    setIsSubmitting(true);
    try {
      await settingsService.admin.updateGst(data.gst);
      toast.success("GST updated successfully ✅");
    } catch {
      toast.error("Failed to update GST");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout title="GST Settings">
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-lg p-8 rounded-2xl shadow-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gst">GST Percentage (%)</Label>
              <Input
                id="gst"
                type="number"
                min={0}
                max={99}
                required
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update GST"}
            </Button>
          </form>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
