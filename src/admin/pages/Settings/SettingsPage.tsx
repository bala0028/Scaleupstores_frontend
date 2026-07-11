import { useEffect, useState } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/admin/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { settingsService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import type { CourierChargeSlab } from "@/shared/api/services/types";

interface SlabFormState {
  state: string;
  minWeight: string;
  maxWeight: string;
  courierCharge: string;
}

const EMPTY_SLAB_FORM: SlabFormState = { state: "", minWeight: "", maxWeight: "", courierCharge: "" };

export default function SettingsPage() {
  const [gst, setGst] = useState("");
  const [gstLoading, setGstLoading] = useState(false);

  const [slabs, setSlabs] = useState<CourierChargeSlab[]>([]);
  const [slabsLoading, setSlabsLoading] = useState(true);

  const [slabDialogOpen, setSlabDialogOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<CourierChargeSlab | null>(null);
  const [slabForm, setSlabForm] = useState<SlabFormState>(EMPTY_SLAB_FORM);
  const [savingSlab, setSavingSlab] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slabToDelete, setSlabToDelete] = useState<CourierChargeSlab | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGst = async () => {
    try {
      const res = await settingsService.getGst();
      setGst(String(res.data?.data?.gst_percentage ?? ""));
    } catch {
      toast.error("Failed to load GST setting");
    }
  };

  const fetchSlabs = async () => {
    setSlabsLoading(true);
    try {
      const res = await settingsService.admin.listCourierSlabs();
      setSlabs(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load courier charges");
    } finally {
      setSlabsLoading(false);
    }
  };

  useEffect(() => {
    fetchGst();
    fetchSlabs();
  }, []);

  const handleGstInput = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    if (value === "") return setGst("");
    const num = parseFloat(value);
    if (num >= 0 && num <= 99) setGst(value);
  };

  const handleGstSubmit = async () => {
    if (!gst) return toast.error("Please enter GST value");
    setGstLoading(true);
    try {
      await settingsService.admin.updateGst(Number(gst));
      toast.success("GST updated successfully");
    } catch {
      toast.error("Failed to update GST");
    } finally {
      setGstLoading(false);
    }
  };

  const openAddSlab = () => {
    setEditingSlab(null);
    setSlabForm(EMPTY_SLAB_FORM);
    setSlabDialogOpen(true);
  };

  const openEditSlab = (slab: CourierChargeSlab) => {
    setEditingSlab(slab);
    setSlabForm({
      state: slab.state ?? "",
      minWeight: String(slab.minWeight),
      maxWeight: String(slab.maxWeight),
      courierCharge: String(slab.courierCharge),
    });
    setSlabDialogOpen(true);
  };

  const handleSlabSubmit = async () => {
    const minWeight = parseFloat(slabForm.minWeight);
    const maxWeight = parseFloat(slabForm.maxWeight);
    const courierCharge = parseFloat(slabForm.courierCharge);

    if (Number.isNaN(minWeight) || Number.isNaN(maxWeight) || Number.isNaN(courierCharge)) {
      return toast.error("Please fill in weight range and charge");
    }
    if (maxWeight <= minWeight) {
      return toast.error("Max weight must be greater than min weight");
    }

    setSavingSlab(true);
    try {
      await settingsService.admin.saveCourierSlab({
        id: editingSlab?.id,
        state: slabForm.state.trim() || undefined,
        minWeight,
        maxWeight,
        courierCharge,
      });
      toast.success(editingSlab ? "Courier charge updated" : "Courier charge added");
      setSlabDialogOpen(false);
      fetchSlabs();
    } catch {
      toast.error("Failed to save courier charge");
    } finally {
      setSavingSlab(false);
    }
  };

  const handleDeleteSlab = async () => {
    if (!slabToDelete) return;
    setDeleting(true);
    try {
      await settingsService.admin.deleteCourierSlab(slabToDelete.id);
      toast.success("Courier charge deleted");
      setDeleteDialogOpen(false);
      setSlabToDelete(null);
      fetchSlabs();
    } catch {
      toast.error("Failed to delete courier charge");
    } finally {
      setDeleting(false);
    }
  };

  const columns: AdminTableColumn<CourierChargeSlab>[] = [
    {
      name: "State",
      selector: (row) => row.state ?? "Default",
      sortable: true,
    },
    {
      name: "Weight Range",
      cell: (row) => `${row.minWeight.toFixed(2)} - ${row.maxWeight.toFixed(2)} kg`,
    },
    {
      name: "Charge",
      selector: (row) => row.courierCharge,
      cell: (row) => `₹${row.courierCharge.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditSlab(row)}>
            <Pencil className="h-5 w-5 text-admin-accent" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSlabToDelete(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminPageLayout title="Settings" description="Manage courier charges and tax configuration">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <Card className="shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Courier charges</h3>
              <p className="text-sm text-muted-foreground">Weight-based shipping rates by state</p>
            </div>
            <Button onClick={openAddSlab}>+ Add</Button>
          </div>
          {slabsLoading ? (
            <div className="flex justify-center py-10 items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
              <span className="text-muted-foreground">Loading courier charges...</span>
            </div>
          ) : (
            <AdminDataTable columns={columns} data={slabs} noDataMessage="No courier charges configured." />
          )}
        </Card>

        <Card className="shadow-sm p-6">
          <h3 className="text-lg font-semibold text-foreground">GST configuration</h3>
          <p className="text-sm text-muted-foreground mb-4">Tax percentage applied to orders</p>
          <div className="space-y-2 mb-4">
            <Label htmlFor="gst">GST (%)</Label>
            <Input id="gst" type="number" min={0} max={99} value={gst} onChange={(e) => handleGstInput(e.target.value)} />
          </div>
          <Button onClick={handleGstSubmit} disabled={gstLoading} className="w-full">
            {gstLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Update GST"
            )}
          </Button>
        </Card>
      </div>

      <Dialog open={slabDialogOpen} onOpenChange={setSlabDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSlab ? "Edit Courier Charge" : "Add Courier Charge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="slab-state">State</Label>
              <Input
                id="slab-state"
                placeholder="e.g. Karnataka (leave blank for default)"
                value={slabForm.state}
                onChange={(e) => setSlabForm((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="slab-min">Min Weight (kg)</Label>
                <Input
                  id="slab-min"
                  type="number"
                  min={0}
                  step="0.01"
                  value={slabForm.minWeight}
                  onChange={(e) => setSlabForm((prev) => ({ ...prev, minWeight: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slab-max">Max Weight (kg)</Label>
                <Input
                  id="slab-max"
                  type="number"
                  min={0}
                  step="0.01"
                  value={slabForm.maxWeight}
                  onChange={(e) => setSlabForm((prev) => ({ ...prev, maxWeight: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="slab-charge">Charge (₹)</Label>
              <Input
                id="slab-charge"
                type="number"
                min={0}
                step="0.01"
                value={slabForm.courierCharge}
                onChange={(e) => setSlabForm((prev) => ({ ...prev, courierCharge: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSlabDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSlabSubmit} disabled={savingSlab}>
              {savingSlab ? "Saving..." : editingSlab ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-center">
            Are you sure you want to delete the courier charge for{" "}
            <strong className="text-destructive">{slabToDelete?.state ?? "Default"}</strong> (
            {slabToDelete?.minWeight.toFixed(2)} - {slabToDelete?.maxWeight.toFixed(2)} kg)?
          </p>
          <DialogFooter className="justify-center gap-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSlab} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
