import { Column } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn('text-sm font-medium', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <button
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn('flex w-full items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors', className)}
    >
      {title}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
