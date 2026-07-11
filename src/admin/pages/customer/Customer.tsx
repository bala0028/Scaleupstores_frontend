import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import { Eye, Search } from "lucide-react";
import { customerService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import ViewCustomer from "./ViewCustomer";
import type { Customer } from "@/shared/api/services/types";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomer, setFilteredCustomer] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCustomerId, setViewCustomerId] = useState<string | number | null>(null);

  const fetchCustomers = useCallback(
    async (pageNumber = page, pageSize = itemsPerPage) => {
      setLoading(true);
      try {
        const res = await customerService.admin.list({
          // @ts-expect-error — params accepted by API but not in type
          params: { page: pageNumber, page_size: pageSize },
        });
        const data = res.data.data || res.data.results || [];
        setCustomers(data);
        setFilteredCustomer(data);
        setTotalCustomers(res.data.count || res.data.total_count || data.length);
      } catch (err: unknown) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, itemsPerPage]
  );

  useEffect(() => {
    fetchCustomers(page, itemsPerPage);
  }, [fetchCustomers]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) setFilteredCustomer(customers);
      else {
        const lower = search.toLowerCase();
        setFilteredCustomer(
          customers.filter((c) =>
            [
              c.full_name ?? c.fullName,
              c.email,
              c.phone,
              c.gender,
              c.address,
              c.loginMethod ?? c.login_method,
            ].some((v) => v?.toString().toLowerCase().includes(lower))
          )
        );
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, customers]);

  const columns: AdminTableColumn<Customer>[] = [
    { name: "ID", selector: (row) => String(row.id ?? ""), sortable: true },
    { name: "Name", selector: (row) => String(row.full_name ?? row.fullName ?? ""), sortable: true },
    { name: "Email", selector: (row) => String(row.email ?? ""), sortable: true },
    { name: "Phone", selector: (row) => String(row.phone ?? ""), sortable: true },
    { name: "DOB", selector: (row) => String(row.dob ?? ""), sortable: true },
    { name: "Gender", selector: (row) => String(row.gender ?? ""), sortable: true },
    { name: "Address", selector: (row) => String(row.address ?? ""), sortable: true },
    { name: "Login Method", selector: (row) => String(row.loginMethod ?? row.login_method ?? ""), sortable: true },
    { name: "Status", selector: (row) => (row.isActive ?? row.is_active ?? false) ? "Active" : "Inactive", sortable: true },
    { name: "Created At", selector: (row) => String(row.createdAt ?? row.created_at ?? ""), sortable: true },
    { name: "Updated At", selector: (row) => String(row.updatedAt ?? row.updated_at ?? ""), sortable: true },
    {
      name: "Actions",
      cell: (row: Customer) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setViewCustomerId(row.id);
            setViewOpen(true);
          }}
        >
          <Eye className="h-5 w-5" />
        </Button>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Customers"
      actions={
        <div className="relative w-full sm:w-64 sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <Card className="shadow-sm">
        {loading ? (
          <div className="flex justify-center py-10 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-blue-600" />
            <span className="text-muted-foreground">Loading customers...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredCustomer}
            serverSide
            page={page}
            totalRows={totalCustomers}
            rowsPerPage={itemsPerPage}
            onPageChange={setPage}
            noDataMessage="No Customer found."
          />
        )}
      </Card>
      {viewOpen && (
        <ViewCustomer open={viewOpen} handleOpenClose={setViewOpen} entityId={viewCustomerId} />
      )}
    </AdminPageLayout>
  );
}
