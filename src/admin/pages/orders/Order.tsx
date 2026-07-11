import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import { Eye, RefreshCw, Search, Printer } from "lucide-react";
import { orderService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import ViewOrder from "./ViewOrder";
import OrderUpdate from "./OrderUpdate";
import type { Order } from "@/shared/api/services/types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [search, setSearch] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | number | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateOrderId, setUpdateOrderId] = useState<string | number | null>(null);
  const activeFetch = useRef<symbol | null>(null);

  const fetchOrders = useCallback(async (pageNumber = 1, pageSize = 10) => {
    const fetchId = Symbol("fetchId");
    activeFetch.current = fetchId;
    setLoading(true);
    try {
      const res = await orderService.admin.list({ page: pageNumber, page_size: pageSize });
      if (activeFetch.current !== fetchId) return;
      const data = res.data?.data;
      setOrders(data?.orders ?? []);
      setTotalOrders(data?.total ?? 0);
      setPage(data?.page ?? 1);
      setItemsPerPage(data?.page_size ?? pageSize);
    } catch (err: unknown) {
      console.error("Error fetching orders:", err);
    } finally {
      if (activeFetch.current === fetchId) setLoading(false);
    }
  }, []);

  const fetchGlobalSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setIsGlobalSearch(false);
        fetchOrders(1, itemsPerPage);
        return;
      }
      setIsGlobalSearch(true);
      const fetchId = Symbol("fetchId");
      activeFetch.current = fetchId;
      setLoading(true);
      try {
        const res = await orderService.admin.search(trimmed);
        if (activeFetch.current !== fetchId) return;
        const results = res.data?.data?.orders ?? [];
        setOrders(results);
        setTotalOrders(results.length);
      } catch (err: unknown) {
        console.error("Global search error:", err);
      } finally {
        if (activeFetch.current === fetchId) setLoading(false);
      }
    },
    [fetchOrders, itemsPerPage]
  );

  const printSingle = async (id: number) => {
    const res = await orderService.admin.printSingle(id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "single_address.pdf");
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    if (!isGlobalSearch) fetchOrders(page, itemsPerPage);
  }, [fetchOrders, page, itemsPerPage, isGlobalSearch]);
  useEffect(() => {
    const h = setTimeout(() => fetchGlobalSearch(search), 600);
    return () => clearTimeout(h);
  }, [search, fetchGlobalSearch]);

  const columns: AdminTableColumn<Order>[] = useMemo(
    () => [
      { name: "Order Number", selector: (row: Order) => (row.order_number ?? row.orderNumber ?? "") as string },
      {
        name: "Status",
        selector: (row: Order) => (row.status ?? row.orderStatus ?? row.order_status ?? "") as string,
        sortable: true,
        cell: (row: Order) => {
          const status = (row.status ?? row.orderStatus ?? row.order_status ?? "") as string;
          let textClass = "text-primary";
          if (status === "order_confirmed") textClass = "text-admin-accent";
          if (status === "shipped") textClass = "text-info";
          if (status === "delivered") textClass = "text-success";
          if (status === "cancelled" || status === "returned") textClass = "text-destructive";

          return (
            <span className={`${textClass} text-[11px] font-bold uppercase`}>
              {status.replace(/_/g, " ")}
            </span>
          );
        },
      },
      {
        name: "Payment Status",
        selector: (row: Order) => (row.payment_status ?? row.paymentStatus ?? "") as string,
        sortable: true,
        cell: (row: Order) => {
          const status = (row.payment_status ?? row.paymentStatus ?? "") as string;
          const textClass =
            status === "success"
              ? "text-success"
              : status === "failed"
                ? "text-destructive"
                : "text-secondary-foreground";
          return <span className={`${textClass} text-[11px] font-bold uppercase`}>{status}</span>;
        },
      },
      {
        name: "Total Amount (₹)",
        selector: (row: Order) => Number(row.total_amount ?? row.totalAmount) || 0,
        sortable: true,
        cell: (row: Order) => (
          <span className="font-medium">₹{Number(row.total_amount ?? row.totalAmount).toFixed(2)}</span>
        ),
      },
      {
        name: "Address Print",
        selector: (row: Order) => (row.is_printed ?? row.isPrinted ? "Yes" : "No"),
        sortable: true,
        cell: (row: Order) => {
          const printed = row.is_printed ?? row.isPrinted;
          return (
            <span className={`${printed ? "text-success" : "text-destructive"} text-[11px] font-bold uppercase`}>
              {printed ? "Printed" : "Not Printed"}
            </span>
          );
        },
      },
      {
        name: "Actions",
        cell: (row: Order) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setViewOrderId(row.id);
                setViewOpen(true);
              }}
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => printSingle(row.id)}>
              <Printer className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setUpdateOrderId(row.id);
                setUpdateOpen(true);
              }}
            >
              <RefreshCw className="h-5 w-5 text-admin-accent" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminPageLayout
      title="Orders"
      actions={
        <div className="relative w-full sm:w-72">
          <Input
            className="pr-9"
            placeholder="Order search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={orders}
            serverSide={!isGlobalSearch}
            page={page}
            totalRows={totalOrders}
            rowsPerPage={itemsPerPage}
            onPageChange={(newPage) => {
              if (!isGlobalSearch && newPage !== page) setPage(newPage);
            }}
            noDataMessage="No orders found."
          />
        )}
      </Card>

      {viewOpen && (
        <ViewOrder open={viewOpen} handleOpenClose={setViewOpen} entityId={viewOrderId} />
      )}
      {updateOpen && (
        <OrderUpdate
          open={updateOpen}
          handleOpenClose={setUpdateOpen}
          entityId={updateOrderId}
          refresh={() =>
            isGlobalSearch ? fetchGlobalSearch(search) : fetchOrders(page, itemsPerPage)
          }
        />
      )}
    </AdminPageLayout>
  );
}
