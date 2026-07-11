import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/admin/components/ui/Card";
import { Input } from "@/admin/components/ui/Input";
import { Button } from "@/admin/components/ui/Button";
import { Eye, Search } from "lucide-react";
import { contactService } from "@/shared/api/services";
import { AdminPageLayout } from "@/admin/components/AdminPageLayout";
import { AdminDataTable, type AdminTableColumn } from "@/admin/components/AdminDataTable";
import ViewContact from "./ViewContact";
import type { Contact } from "@/shared/api/services/types";

export default function ContactUs() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContacts, setTotalContacts] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContactId, setViewContactId] = useState<string | number | null>(null);
  const isFetching = useRef(false);

  const fetchContacts = useCallback(async (pageNumber = 1, pageSize = 10) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await contactService.admin.list({
        // @ts-expect-error — params accepted by API but not in type
        params: { page: pageNumber, page_size: pageSize },
      });
      const results = res.data.data || [];
      setContacts(results);
      setFilteredContacts(results);
      setTotalContacts(res.data.total_items ?? 0);
    } catch (err: unknown) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
      setTimeout(() => (isFetching.current = false), 200);
    }
  }, []);

  useEffect(() => {
    fetchContacts(page, itemsPerPage);
  }, [fetchContacts, page, itemsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!search.trim()) setFilteredContacts(contacts);
      else {
        const lower = search.toLowerCase();
        setFilteredContacts(
          contacts.filter((c) =>
            [c.name, c.email, c.phone].some((f) => f?.toLowerCase().includes(lower))
          )
        );
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, contacts]);

  const columns: AdminTableColumn<Contact>[] = [
    { name: "Name", selector: (r: Contact) => r.name ?? "" },
    { name: "Email", selector: (r: Contact) => r.email ?? "" },
    { name: "Phone", selector: (r: Contact) => r.phone ?? "" },
    {
      name: "Actions",
      cell: (row: Contact) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setViewContactId(row.id);
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
      title="Contacts"
      actions={
        <div className="relative w-full sm:w-64 sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search contact..."
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
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredContacts}
            serverSide
            page={page}
            totalRows={totalContacts}
            rowsPerPage={itemsPerPage}
            onPageChange={setPage}
            noDataMessage="No contacts found."
          />
        )}
      </Card>
      {viewOpen && (
        <ViewContact open={viewOpen} handleOpenClose={setViewOpen} entityId={viewContactId} />
      )}
    </AdminPageLayout>
  );
}
