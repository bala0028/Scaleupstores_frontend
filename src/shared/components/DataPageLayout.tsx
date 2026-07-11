import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import type { ReactNode } from "react";

interface DataPageLayoutProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function DataPageLayout({
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  onAdd,
  addLabel = "Add New",
  children,
  actions,
}: DataPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
          {onSearchChange && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> {addLabel}
            </Button>
          )}
          {actions}
        </div>
      </div>
      <Card className="shadow-sm">{children}</Card>
    </div>
  );
}
