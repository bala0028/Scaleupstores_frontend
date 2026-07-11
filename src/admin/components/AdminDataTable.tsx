import { useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import Pagination from "@mui/material/Pagination";

export interface AdminTableColumn<T> {
  name: string;
  selector?: (row: T) => string | number | null | undefined;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  /** Field name to report to onServerSort — defaults to `name` if omitted. */
  sortField?: string;
  width?: string;
}

interface AdminDataTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  pagination?: boolean;
  rowsPerPage?: number;
  noDataMessage?: string;
  keyField?: keyof T;
  /**
   * Server-driven pagination: `data` is assumed to already be just the
   * current page's rows, and `page`/`onPageChange` control navigation
   * instead of local slicing.
   */
  serverSide?: boolean;
  page?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  /** Adds a checkbox column; fires with the full set of selected row objects on every change. */
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  /**
   * When provided, clicking a sortable column header calls this instead of
   * sorting `data` locally — the server is assumed to own sort order.
   */
  onServerSort?: (field: string, direction: "asc" | "desc") => void;
}

const ROWS_PER_PAGE_DEFAULT = 10;

export function AdminDataTable<T extends Record<string, any>>({
  columns,
  data,
  pagination = true,
  rowsPerPage = ROWS_PER_PAGE_DEFAULT,
  noDataMessage = "No records found.",
  keyField = "id" as keyof T,
  serverSide = false,
  page: controlledPage,
  totalRows,
  onPageChange,
  selectable = false,
  onSelectionChange,
  onServerSort,
}: AdminDataTableProps<T>) {
  const [localPage, setLocalPage] = useState(1);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const sortedData = useMemo(() => {
    if (onServerSort) return data;
    if (sortCol === null || !columns[sortCol]?.selector) return data;
    const selector = columns[sortCol].selector!;
    return [...data].sort((a, b) => {
      const av = selector(a) ?? "";
      const bv = selector(b) ?? "";
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortCol, sortAsc, columns, onServerSort]);

  const totalPages = serverSide
    ? Math.max(1, Math.ceil((totalRows ?? data.length) / rowsPerPage))
    : Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const currentPage = serverSide
    ? Math.min(controlledPage ?? 1, totalPages)
    : Math.min(localPage, totalPages);
  const pageData = serverSide
    ? sortedData
    : pagination
      ? sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      : sortedData;

  const goToPage = (p: number) => {
    if (serverSide) onPageChange?.(p);
    else setLocalPage(p);
  };

  const toggleSort = (colIndex: number) => {
    if (!columns[colIndex]?.sortable) return;
    const nextAsc = sortCol === colIndex ? !sortAsc : true;
    setSortCol(colIndex);
    setSortAsc(nextAsc);
    if (onServerSort) {
      const col = columns[colIndex];
      onServerSort(col.sortField ?? col.name, nextAsc ? "asc" : "desc");
    }
  };

  const emitSelection = (keys: Set<string>) => {
    const rows = data.filter((row) => keys.has(String(row[keyField])));
    onSelectionChange?.(rows);
  };

  const toggleRowSelected = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      emitSelection(next);
      return next;
    });
  };

  const allPageKeys = pageData.map((row) => String(row[keyField]));
  const allPageSelected = allPageKeys.length > 0 && allPageKeys.every((k) => selectedKeys.has(k));
  const somePageSelected = allPageKeys.some((k) => selectedKeys.has(k)) && !allPageSelected;

  const toggleAllOnPage = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        allPageKeys.forEach((k) => next.delete(k));
      } else {
        allPageKeys.forEach((k) => next.add(k));
      }
      emitSelection(next);
      return next;
    });
  };

  return (
    <div>
      <TableContainer className="overflow-x-auto">
        <Table size="small" aria-label="Data table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onChange={toggleAllOnPage}
                    slotProps={{ input: { "aria-label": "Select all rows on this page" } }}
                  />
                </TableCell>
              )}
              {columns.map((col, i) => (
                <TableCell key={col.name || i} style={col.width ? { width: col.width } : undefined}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortCol === i}
                      direction={sortCol === i ? (sortAsc ? "asc" : "desc") : "asc"}
                      onClick={() => toggleSort(i)}
                    >
                      {col.name}
                    </TableSortLabel>
                  ) : (
                    col.name
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  className="py-10 text-muted-foreground"
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((row) => {
                const key = String(row[keyField]);
                return (
                  <TableRow key={key} hover selected={selectedKeys.has(key)}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedKeys.has(key)}
                          onChange={() => toggleRowSelected(key)}
                          slotProps={{ input: { "aria-label": "Select row" } }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, i) => (
                      <TableCell key={col.name || i}>
                        {col.cell ? col.cell(row) : col.selector ? String(col.selector(row) ?? "") : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && totalPages > 1 && (
        <div className="flex justify-center py-4">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, p) => goToPage(p)}
            shape="rounded"
            size="small"
          />
        </div>
      )}
    </div>
  );
}
