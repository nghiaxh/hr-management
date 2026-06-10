import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  PaginationState,
  RowSelectionState,
  OnChangeFn,
  flexRender,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { DataTablePagination } from './data-table-pagination';
import { cn } from '../../lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean | ((row: any) => boolean);
  getRowId?: (row: TData) => string;
  toolbar?: React.ReactNode;
  totalLabel?: string;
  noPagination?: boolean;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  error,
  emptyMessage = 'No results.',
  onRowClick,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  pageCount,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  enableRowSelection,
  getRowId,
  toolbar,
  totalLabel,
  noPagination,
  className,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});

  const sorting = controlledSorting ?? internalSorting;
  const pagination = controlledPagination ?? internalPagination;
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  const onSortingChange: OnChangeFn<SortingState> = controlledOnSortingChange ?? setInternalSorting;
  const onPaginationChange: OnChangeFn<PaginationState> = controlledOnPaginationChange ?? setInternalPagination;
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = controlledOnRowSelectionChange ?? setInternalRowSelection;

  const isManualPagination = !!controlledPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(isManualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    state: { sorting, pagination, rowSelection },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange,
    manualPagination: isManualPagination,
    pageCount: isManualPagination ? pageCount : undefined,
    enableRowSelection,
    getRowId,
  });

  return (
    <div className={cn('bg-card rounded-lg border', className)}>
      {toolbar && <div className="flex items-center gap-2 p-4 pb-0">{toolbar}</div>}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan} style={{ width: header.getSize() }}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((_, j) => (
                  <TableCell key={`sc-${i}-${j}`}>
                    <div className="h-4 animate-pulse rounded bg-muted/60" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-destructive py-8">
                {error}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                onClick={() => onRowClick?.(row.original)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!noPagination && (controlledPagination || (!isManualPagination && data.length > 0)) && (
        <div className="border-t">
          <DataTablePagination table={table} totalLabel={totalLabel} />
        </div>
      )}
    </div>
  );
}
