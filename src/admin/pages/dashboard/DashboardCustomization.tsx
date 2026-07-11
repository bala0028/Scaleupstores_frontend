import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { settingsService } from "@/shared/api/services";
import type { DashboardSectionVisibility } from "@/shared/api/services/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { DASHBOARD_TOOL_VERIFIED_KEY } from "./DashboardTool";

const VERIFIED_WINDOW_MS = 10 * 60 * 1000;

const SECTIONS: Array<{ key: keyof DashboardSectionVisibility; label: string; description: string }> = [
  { key: "needsAttention", label: "Needs attention", description: "The alert strip highlighting overdue orders, failed payments, etc." },
  { key: "sales", label: "Sales & Products", description: "Top selling products and sales-related charts." },
  { key: "fulfillment", label: "Fulfillment & Logistics", description: "Order fulfillment funnel and shipping insights." },
  { key: "inventory", label: "Inventory", description: "Stock levels and low-stock alerts." },
  { key: "customers", label: "Customers & Marketing", description: "Customer growth and engagement insights." },
];

const DEFAULT_VISIBILITY: DashboardSectionVisibility = {
  needsAttention: true,
  sales: true,
  fulfillment: true,
  inventory: true,
  customers: true,
};

export default function DashboardCustomization() {
  const navigate = useNavigate();
  const role = useAuth().role;
  const [visibility, setVisibility] = useState<DashboardSectionVisibility>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") return;

    const verifiedAt = Number(sessionStorage.getItem(DASHBOARD_TOOL_VERIFIED_KEY) || 0);
    if (!verifiedAt || Date.now() - verifiedAt > VERIFIED_WINDOW_MS) {
      toast.error("Please verify the OTP first");
      navigate("/dashboard/tool", { replace: true });
      return;
    }

    settingsService.admin
      .getDashboardSections()
      .then((res: any) => {
        const data = res.data?.data || res.data;
        if (data) setVisibility({ ...DEFAULT_VISIBILITY, ...data });
      })
      .catch(() => toast.error("Failed to load dashboard settings"))
      .finally(() => setLoading(false));
  }, [navigate, role]);

  if (role !== "admin") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  const handleToggle = async (key: keyof DashboardSectionVisibility, checked: boolean) => {
    const previous = visibility;
    const updated = { ...visibility, [key]: checked };
    setVisibility(updated);
    setSavingKey(key);
    try {
      await settingsService.admin.updateDashboardSections(updated);
      toast.success("Dashboard settings updated");
    } catch {
      setVisibility(previous);
      toast.error("Failed to update setting");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Customization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which sections appear on the admin dashboard.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {SECTIONS.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={visibility[key]}
                  disabled={savingKey === key}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
