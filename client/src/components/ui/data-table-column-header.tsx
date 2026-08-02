import { Column } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { ArrowUp, ArrowDown, CaretUpDown } from '@phosphor-icons/react';

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
    return <span className={cn('text-xs font-medium uppercase tracking-wide', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : CaretUpDown;

  return (
    <button
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn('flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted hover:text-foreground transition-colors', className)}
    >
      {title}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
