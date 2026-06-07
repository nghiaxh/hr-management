import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/shared/status-badge';
import { SkeletonList } from '../../components/shared/skeleton';
import { useTranslation } from '../../context/language-context';
import { useToast } from '../../hooks/use-toast';
import { Plus, Search, Trash2, Download, CheckSquare, Square, ChevronDown } from 'lucide-react';

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
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, page],
    queryFn: () => employeesApi.getAll({ search, page, limit }),
  });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (formData: any) => employeesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
      createForm.reset();
    },
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
      setSelected(new Set());
      toast({ title: `${ids.length} ${t('employees.bulk_deleted')}` });
    },
  });

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      firstName: '', lastName: '', position: '', salary: 0,
      departmentId: '', hireDate: '', phone: '', contractType: '',
      contractExpiry: '', userId: '',
    },
  });

  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / limit) : 0;
  const allIds = data?.data?.map((e: any) => e._id) || [];
  const allSelected = allIds.length > 0 && allIds.every((id: string) => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  if (isLoading) return <SkeletonList />;

  return (
    <div>
      <PageHeader title={t('employees.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('employees.add')}</Button>} />
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('employees.search')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full md:max-w-sm" />
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selected.size} {t('employees.selected')}</span>
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t('employees.delete_bulk')}
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => employeesApi.exportCsv()}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t('employees.export_csv')}
          </Button>
        </div>
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <button onClick={toggleAll} className="flex items-center cursor-pointer">
                  {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>
              </TableHead>
              <TableHead>{t('employees.name')}</TableHead>
              <TableHead>{t('employees.position')}</TableHead>
              <TableHead>{t('employees.department')}</TableHead>
              <TableHead>{t('employees.salary')}</TableHead>
              <TableHead className="w-16">{t('departments.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((emp: any) => (
              <TableRow key={emp._id}>
                <TableCell>
                  <button onClick={() => toggleOne(emp._id)} className="flex items-center cursor-pointer">
                    {selected.has(emp._id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </TableCell>
                <TableCell><Link to={`/employees/${emp._id}`} className="text-primary hover:underline">{emp.firstName} {emp.lastName}</Link></TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.departmentId?.name || t('performance_reviews.na')}</TableCell>
                <TableCell>${emp.salary?.toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(emp)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('employees.no_results')}</TableCell></TableRow>}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {meta!.total} {t('employees.total')}
              </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                {t('employees.previous')}
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, page - 2);
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-8" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                {t('employees.next')}
              </Button>
            </div>
          </div>
        )}
      </div>

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
                  {departments?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
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
        description={`${t('auth.confirm_bulk_delete_desc').replace('{count}', String(selected.size))}`}
        confirmLabel={t('employees.delete_bulk')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { bulkDeleteMutation.mutate(Array.from(selected)); setBulkDeleteOpen(false); }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.delete_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.delete_confirm_sr')}</DialogDescription>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('departments.delete_confirm')} <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? {t('departments.delete_warning')}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('employees.cancel')}</Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? t('employees.deleting') : t('employees.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
