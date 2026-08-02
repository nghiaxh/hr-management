import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createColumnHelper } from '@tanstack/react-table';
import { departmentsApi } from '../../api/departments';
import { employeesApi } from '../../api/employees';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Plus, PencilSimple, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { useTranslation } from '../../context/language-context';
import { toast } from '../../hooks/use-toast';
import { useDebounce } from '../../hooks/use-debounce';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import { Department } from '../../types';

const columnHelper = createColumnHelper<Department>();

const deptSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  managerId: z.string().optional(),
});

export default function DepartmentsListPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDept, setDeletingDept] = useState<any>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['departments', debouncedSearch], queryFn: () => departmentsApi.getAll({ search: debouncedSearch }) });
  const { data: employees } = useQuery({ queryKey: ['employees-min'], queryFn: () => employeesApi.getAll({ limit: 100 }) });

  const managers = employees?.data?.filter((e: any) => e.userId?.role === 'manager' || e.userId?.role === 'admin') || [];

  const createForm = useForm<z.infer<typeof deptSchema>>({ resolver: zodResolver(deptSchema), defaultValues: { name: '', description: '', managerId: '' } });
  const editForm = useForm<z.infer<typeof deptSchema>>({ resolver: zodResolver(deptSchema) });

  useEffect(() => {
    if (editingDept) {
      editForm.reset({
        name: editingDept.name || '',
        description: editingDept.description || '',
        managerId: editingDept.managerId?.id || editingDept.managerId || '',
      });
    }
  }, [editingDept]);

  const createMutation = useMutation({
    mutationFn: (d: any) => departmentsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setOpen(false); createForm.reset(); toast({ title: t('departments.created') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('departments.create_failed'), variant: 'destructive' }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setEditOpen(false); setEditingDept(null); toast({ title: t('departments.updated') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('departments.update_failed'), variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setDeleteOpen(false); setDeletingDept(null); toast({ title: t('departments.deleted') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('departments.delete_failed'), variant: 'destructive' }),
  });

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('departments.name')} />,
    }),
    columnHelper.accessor('description', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('departments.description')} />,
      cell: ({ getValue }) => getValue() || '-',
    }),
    columnHelper.accessor((row) => (row.managerId as any)?.email || '-', {
      id: 'manager',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('departments.manager')} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('departments.actions'),
      cell: ({ row }) => (
        <div className="flex gap-1">
          <TooltipRoot>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingDept(row.original); setEditOpen(true); }} aria-label={t('departments.edit')}><PencilSimple className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>{t('departments.edit')}</TooltipContent>
          </TooltipRoot>
          <TooltipRoot>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="hover:text-danger" onClick={(e) => { e.stopPropagation(); setDeletingDept(row.original); setDeleteOpen(true); }} aria-label={t('departments.delete')}><Trash className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>{t('departments.delete')}</TooltipContent>
          </TooltipRoot>
        </div>
      ),
    }),
  ];

  return (
    <div>
      <PageHeader title={t('departments.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('departments.add')}</Button>} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('departments.load_failed') : undefined}
        emptyMessage={t('departments.no_results')}
        getRowId={(row) => row.id}
        toolbar={
          <>
            <MagnifyingGlass className="h-4 w-4 text-muted shrink-0" />
            <Input placeholder={t('departments.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm" />
          </>
        }
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) createForm.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.add')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('departments.create_sr')}</DialogDescription>
          <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div><Label>{t('departments.name')}</Label><Input {...createForm.register('name')} /></div>
            <div><Label>{t('departments.description')}</Label><Input {...createForm.register('description')} /></div>
            <div>
              <Label>{t('departments.manager')}</Label>
              <Select {...createForm.register('managerId')}>
                <option value="">{t('employees.none')}</option>
                {managers.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.userId?.email})</option>)}
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('departments.creating') : t('departments.create')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditingDept(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.edit')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('departments.edit_sr')}</DialogDescription>
          <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate({ id: editingDept.id, data }))} className="space-y-4">
            <div><Label>{t('departments.name')}</Label><Input {...editForm.register('name')} /></div>
            <div><Label>{t('departments.description')}</Label><Input {...editForm.register('description')} /></div>
            <div>
              <Label>{t('departments.manager')}</Label>
              <Select {...editForm.register('managerId')}>
                <option value="">{t('employees.none')}</option>
                {managers.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.userId?.email})</option>)}
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('departments.saving') : t('departments.save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('departments.delete')}
        description={<>{t('departments.delete_confirm')} <strong>{deletingDept?.name}</strong>? {t('departments.delete_warning')}</>}
        confirmLabel={t('departments.delete')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (deletingDept) deleteMutation.mutate(deletingDept.id); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
