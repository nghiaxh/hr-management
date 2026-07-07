import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { createColumnHelper, PaginationState } from '@tanstack/react-table';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/shared/status-badge';
import { SkeletonList } from '../../components/shared/skeleton';
import { useTranslation } from '../../context/language-context';
import { useToast } from '../../hooks/use-toast';
import { useDebounce } from '../../hooks/use-debounce';
import { Plus, Search, Trash2, Download, Loader2 } from 'lucide-react';
import { Employee } from '../../types';

const columnHelper = createColumnHelper<Employee>();

export default function EmployeesListPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const createSchema = z.object({
    firstName: z.string().min(1, t('validation.first_name_required')),
    lastName: z.string().min(1, t('validation.last_name_required')),
    position: z.string().min(1, t('validation.position_required')),
    salary: z.coerce.number().min(0, t('validation.salary_positive')),
    departmentId: z.string().min(1, t('validation.department_required')),
    hireDate: z.string().min(1, t('validation.hire_date_required')),
    phone: z.string().optional(),
    contractType: z.string().optional(),
    contractExpiry: z.string().optional(),
    userId: z.string().min(1, t('validation.user_id_required')),
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['employees', debouncedSearch, pagination.pageIndex + 1],
    queryFn: () => employeesApi.getAll({ search: debouncedSearch, page: pagination.pageIndex + 1, limit: pagination.pageSize }),
  });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (formData: any) => employeesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
      createForm.reset();
      toast({ title: t('employees.created') });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('employees.create_failed'), variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteTarget(null);
      toast({ title: t('employees.deleted') });
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('employees.delete_failed'), variant: 'destructive' });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => employeesApi.bulkDelete(ids),
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setRowSelection({});
      toast({ title: `${ids.length} ${t('employees.bulk_deleted')}` });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('employees.bulk_delete_failed'), variant: 'destructive' }),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      await employeesApi.exportCsv();
      toast({ title: t('employees.exported') });
    } catch {
      toast({ title: t('employees.export_failed'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      firstName: '', lastName: '', position: '', salary: 0,
      departmentId: '', hireDate: '', phone: '', contractType: '',
      contractExpiry: '', userId: '',
    },
  });

  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / pagination.pageSize) : 0;
  const selectedIds = Object.keys(rowSelection).filter((k) => (rowSelection as any)[k]);

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => { if (el) el.indeterminate = table.getIsSomePageRowsSelected(); }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select row ${row.id}`}
        />
      ),
    }),
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.name')} />,
      cell: ({ row, getValue }) => (
        <Link to={`/employees/${row.original.id}`} className="text-primary hover:underline">
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('position', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.position')} />,
    }),
    columnHelper.accessor((row) => (row.departmentId as any)?.name || t('performance_reviews.na'), {
      id: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.department')} />,
    }),
    columnHelper.accessor('salary', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('employees.salary')} />,
      cell: ({ getValue }) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getValue() as number),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('departments.actions'),
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row.original); }} aria-label={t('employees.delete')}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  if (isLoading) return <SkeletonList />;

  return (
    <div>
      <PageHeader title={t('employees.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('employees.add')}</Button>} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        error={isError ? (queryError as any)?.response?.data?.message || t('employees.load_failed') : undefined}
        emptyMessage={t('employees.no_results')}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={totalPages}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
        totalLabel={`${meta?.total ?? 0} ${t('employees.total')}`}
        toolbar={
          <>
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input placeholder={t('employees.search')} value={search} onChange={e => { setSearch(e.target.value); setPagination((prev) => ({ ...prev, pageIndex: 0 })); }} className="w-full md:max-w-sm" />
            <div className="ml-auto flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">{selectedIds.length} {t('employees.selected')}</span>
                  <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {t('employees.delete_bulk')}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                {t('employees.export_csv')}
              </Button>
            </div>
          </>
        }
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) createForm.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.add')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.create_record_sr')}</DialogDescription>
          <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('employees.first_name')}</Label>
                <Input {...createForm.register('firstName')} />
                {createForm.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <Label>{t('employees.last_name')}</Label>
                <Input {...createForm.register('lastName')} />
                {createForm.formState.errors.lastName && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.lastName.message}</p>}
              </div>
              <div>
                <Label>{t('employees.position')}</Label>
                <Input {...createForm.register('position')} />
                {createForm.formState.errors.position && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.position.message}</p>}
              </div>
              <div>
                <Label>{t('employees.salary')}</Label>
                <Input type="number" {...createForm.register('salary')} />
                {createForm.formState.errors.salary && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.salary.message}</p>}
              </div>
              <div>
                <Label>{t('employees.department')}</Label>
                <select {...createForm.register('departmentId')} className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="">{t('employees.select')}</option>
                  {departments?.data?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {createForm.formState.errors.departmentId && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.departmentId.message}</p>}
              </div>
              <div>
                <Label>{t('employees.hire_date')}</Label>
                <Input type="date" {...createForm.register('hireDate')} />
                {createForm.formState.errors.hireDate && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.hireDate.message}</p>}
              </div>
              <div>
                <Label>{t('employees.phone')}</Label>
                <Input {...createForm.register('phone')} />
              </div>
              <div>
                <Label>{t('employees.contract_type_label')}</Label>
                <select {...createForm.register('contractType')} className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="">{t('employees.none')}</option>
                  <option value="permanent">{t('employees.contract_permanent')}</option>
                  <option value="contract">{t('employees.contract_contract')}</option>
                  <option value="intern">{t('employees.contract_intern')}</option>
                </select>
              </div>
              <div>
                <Label>{t('employees.contract_expiry_label')}</Label>
                <Input type="date" {...createForm.register('contractExpiry')} />
              </div>
              <div>
                <Label>{t('employees.user_id')}</Label>
                <Input {...createForm.register('userId')} placeholder={t('employees.user_id_placeholder')} />
                {createForm.formState.errors.userId && <p className="text-xs text-destructive mt-1">{createForm.formState.errors.userId.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('employees.creating') : t('employees.create')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={t('auth.confirm_bulk_delete')}
        description={`${t('auth.confirm_bulk_delete_desc').replace('{count}', String(selectedIds.length))}`}
        confirmLabel={t('employees.delete_bulk')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { bulkDeleteMutation.mutate(selectedIds); setBulkDeleteOpen(false); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title={t('employees.delete_title')}
        description={(<>{t('employees.delete_confirm')} <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? {t('employees.delete_warning')}</>)}
        confirmLabel={t('employees.delete')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
