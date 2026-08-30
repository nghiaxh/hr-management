import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useTranslation } from '../../context/language-context';
import { formatCurrency } from '../../lib/utils';
import { Trash } from '@phosphor-icons/react';
import type { Department, Employee } from '../../types';

const columnHelper = createColumnHelper<Employee>();

export function useEmployeeColumns(onDelete: (employee: Employee) => void): ColumnDef<Employee, any>[] {
  const { t } = useTranslation();

  return [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-foreground"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => { if (el) el.indeterminate = table.getIsSomePageRowsSelected(); }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-foreground"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    }),
    columnHelper.accessor((row) => getFullName(row), {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.name')} />,
      cell: ({ row, getValue }) => (
        <Link to={`/employees/${row.original.id}`} className="text-link hover:underline">
          {getValue() as string}
        </Link>
      ),
    }),
    columnHelper.accessor('position', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.position')} />,
    }),
    columnHelper.accessor((row) => getDepartmentName(row.departmentId), {
      id: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.department')} />,
    }),
    columnHelper.accessor('salary', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.salary')} />,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('departments.actions'),
      cell: ({ row }) => (
        <TooltipRoot>
          <TooltipTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-danger" onClick={(e) => { e.stopPropagation(); onDelete(row.original); }} aria-label={t('employees.delete')}>
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('employees.delete')}</TooltipContent>
        </TooltipRoot>
      ),
    }),
  ];
}

function getFullName(row: Employee) {
  return `${row.firstName} ${row.lastName}`;
}

function getDepartmentName(dept: Department | string) {
  return typeof dept === 'string' ? dept : dept.name;
}
