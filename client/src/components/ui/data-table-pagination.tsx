import { Table } from '@tanstack/react-table';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalLabel?: string;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  totalLabel,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {totalLabel}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="ml-2 h-8 w-16 rounded border bg-background px-1 text-xs"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
