import { useEffect, useState } from "react";
import { Search, Printer } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderRow {
  id: number;
  orderNumber?: string;
  order_number?: string;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  contact_number?: string;
  shippingAddress?: string;
  shipping_address?: string;
  isPrinted?: boolean;
  is_printed?: boolean;
  customer?: { fullName?: string; email?: string };
  [key: string]: unknown;
}

const getOrderNo = (row: OrderRow) => row.orderNumber ?? row.order_number ?? "";
const getCustomerName = (row: OrderRow) =>
  [row.firstName, row.lastName].filter(Boolean).join(" ") ||
  row.customer?.fullName ||
  row.customer?.email ||
  "—";
const getPhone = (row: OrderRow) => row.contactNumber ?? row.contact_number ?? "";
const getAddress = (row: OrderRow) => row.shippingAddress ?? row.shipping_address ?? "";
const getIsPrinted = (row: OrderRow) => row.isPrinted ?? row.is_printed ?? false;

export default function PrintAddress() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<OrderRow[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.admin.unprinted({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      const data =
        response.data?.data || response.data?.results?.data || response.data?.results || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fromDate, toDate]);

  useEffect(() => {
    const trimmed = (search || "").trim();
    if (!trimmed) {
      setFilteredOrders(orders);
      return;
    }
    const lower = trimmed.toLowerCase();
    setFilteredOrders(
      orders.filter(
        (o) =>
          getOrderNo(o).toLowerCase().includes(lower) ||
          getCustomerName(o).toLowerCase().includes(lower) ||
          getPhone(o).toLowerCase().includes(lower) ||
          getAddress(o).toLowerCase().includes(lower)
      )
    );
  }, [search, orders]);

  const handlePrint = async () => {
    if (selectedRows.length === 0) {
      toast.error("Select at least one address to print");
      return;
    }
    const ids = selectedRows.map((o) => o.id);
    try {
      toast.loading("Generating PDF...");
      const response = await orderService.admin.printAddress(ids);
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", "address_labels.pdf");
      document.body.appendChild(link);
      link.click();
      toast.dismiss();
      toast.success("PDF Generated Successfully!");
      fetchOrders();
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const columns: AdminTableColumn<OrderRow>[] = [
    { name: "Order No", selector: (row: OrderRow) => getOrderNo(row), sortable: true },
    {
      name: "Customer Name",
      selector: (row: OrderRow) => getCustomerName(row),
      sortable: true,
    },
    { name: "Phone", selector: (row: OrderRow) => getPhone(row), sortable: true },
    {
      name: "Address",
      selector: (row: OrderRow) => getAddress(row),
      cell: (row: OrderRow) => {
        const address = getAddress(row);
        return address.length > 20 ? address.substring(0, 20) + "..." : address;
      },
    },
    {
      name: "Status",
      selector: (row: OrderRow) => (getIsPrinted(row) ? "Yes" : "No"),
      cell: (row: OrderRow) => {
        const printed = getIsPrinted(row);
        return (
          <span
            className={`text-[11px] font-bold uppercase ${printed ? "text-success" : "text-destructive"}`}
          >
            {printed ? "Printed" : "Not Printed"}
          </span>
        );
      },
    },
  ];

  return (
    <AdminPageLayout
      title="Unprinted Addresses"
      description="Orders whose shipping labels haven't been printed yet"
    >
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="w-full sm:w-44">
          <Input
            type="date"
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Input
            type="date"
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search addresses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-5 w-5" /> Print PDF
        </Button>
      </div>

      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <span className="text-muted-foreground">Loading orders...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredOrders}
            selectable
            onSelectionChange={setSelectedRows}
            rowsPerPage={itemsPerPage}
            noDataMessage="No unprinted orders found."
          />
        )}
      </Card>
    </AdminPageLayout>
  );
}
