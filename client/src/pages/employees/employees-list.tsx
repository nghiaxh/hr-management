import { useState } from 'react';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DataTable } from '../../components/ui/data-table';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { EmployeeForm } from '../../components/employees/employee-form';
import { useEmployeeColumns } from '../../components/employees/employee-columns';
import { SkeletonList } from '../../components/shared/skeleton';
import { useEmployees } from './hooks/use-employees';
import { useTranslation } from '../../context/language-context';
import { Plus, MagnifyingGlass, Trash, Download, CircleNotch } from '@phosphor-icons/react';
import type { Employee } from '../../types';

export default function EmployeesListPage() {
  const { t } = useTranslation();
  const employees = useEmployees();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const columns = useEmployeeColumns((employee) => setDeleteTarget(employee));

  if (employees.isLoading) return <SkeletonList />;

  return (
    <div>
      <PageHeader
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('employees.add')}</Button>}
      />
      <DataTable
        columns={columns}
        data={employees.data}
        error={employees.isError ? (employees.queryError as { response?: { data?: { message?: string } } })?.response?.data?.message || t('employees.load_failed') : undefined}
        emptyMessage={t('employees.no_results')}
        pagination={employees.pagination}
        onPaginationChange={employees.setPagination}
        pageCount={employees.totalPages}
        rowSelection={employees.rowSelection}
        onRowSelectionChange={employees.setRowSelection}
        getRowId={(row) => row.id}
        totalLabel={`${employees.meta?.total ?? 0} ${t('employees.total')}`}
        toolbar={
          <>
            <MagnifyingGlass className="h-4 w-4 text-muted shrink-0" />
            <Input
              placeholder={t('employees.search')}
              value={employees.search}
              onChange={e => { employees.setSearch(e.target.value); employees.setPagination((prev) => ({ ...prev, pageIndex: 0 })); }}
              className="w-full md:max-w-sm"
            />
            <div className="ml-auto flex items-center gap-2">
              {employees.selectedIds.length > 0 && (
                <>
                  <span className="text-sm text-muted">{employees.selectedIds.length} {t('employees.selected')}</span>
                  <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                    <Trash className="h-3.5 w-3.5 mr-1.5" />
                    {t('employees.delete_bulk')}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={employees.handleExport} disabled={employees.exporting}>
                {employees.exporting ? <CircleNotch className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                {t('employees.export_csv')}
              </Button>
            </div>
          </>
        }
      />

      <EmployeeForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        departments={employees.departments}
        mutation={employees.createMutation}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t('auth.confirm_bulk_delete')}
        description={`${t('auth.confirm_bulk_delete_desc').replace('{count}', String(employees.selectedIds.length))}`}
        confirmLabel={t('employees.delete_bulk')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { employees.bulkDeleteMutation.mutate(employees.selectedIds); setBulkDeleteOpen(false); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title={t('employees.delete_title')}
        description={(<>{t('employees.delete_confirm')} <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? {t('employees.delete_warning')}</>)}
        confirmLabel={t('employees.delete')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (deleteTarget) employees.deleteMutation.mutate(deleteTarget.id); }}
      />
    </div>
  );
}
