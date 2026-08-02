import { Table } from '@tanstack/react-table';
import { Button } from './button';
import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react';

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
      <p className="text-sm text-muted">
        {totalLabel}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()} aria-label="First page">
          <CaretDoubleLeft weight="bold" className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
          <CaretLeft weight="bold" className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm text-muted px-2 tabular-nums">
          {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
          <CaretRight weight="bold" className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()} aria-label="Last page">
          <CaretDoubleRight weight="bold" className="h-3.5 w-3.5" />
        </Button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="ml-2 h-8 w-16 rounded-lg border border-field-border bg-field px-1.5 text-xs text-field-foreground outline-none"
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
