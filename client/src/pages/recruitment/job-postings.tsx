import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { recruitmentApi } from '../../api/recruitment';
import { departmentsApi } from '../../api/departments';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { useTranslation } from '../../context/language-context';
import { toast } from '../../hooks/use-toast';
import { useDebounce } from '../../hooks/use-debounce';
import { useNavigate } from 'react-router-dom';
import { JobPosting } from '../../types';

const columnHelper = createColumnHelper<JobPosting>();

export default function JobPostingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingJob, setDeletingJob] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['job-postings', debouncedSearch, statusFilter],
    queryFn: () => recruitmentApi.getJobPostings({ search: debouncedSearch || undefined, status: statusFilter || undefined }),
  });
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => recruitmentApi.createJobPosting(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); setOpen(false); toast({ title: t('recruitment.job_created') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('recruitment.job_create_failed'), variant: 'destructive' }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => recruitmentApi.updateJobPosting(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); setEditOpen(false); setEditingJob(null); toast({ title: t('recruitment.job_updated') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('recruitment.job_update_failed'), variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteJobPosting(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['job-postings'] }); setDeleteOpen(false); setDeletingJob(null); toast({ title: t('recruitment.job_deleted') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('recruitment.job_delete_failed'), variant: 'destructive' }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate(Object.fromEntries(form));
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    const form = new FormData(e.target as HTMLFormElement);
    updateMutation.mutate({ id: editingJob._id, data: Object.fromEntries(form) });
  };

  const columns = [
    columnHelper.accessor('title', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.title')} />,
    }),
    columnHelper.accessor((row) => (row.departmentId as any)?.name || '-', {
      id: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.department')} />,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
    columnHelper.accessor('openings', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.openings')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right">{getValue()}</div>,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('recruitment.actions'),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/recruitment/candidates?jobPostingId=${row.original._id}`); }}><Users className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingJob(row.original); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeletingJob(row.original); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    }),
  ];

  return (
    <div>
      <PageHeader title={t('recruitment.job_postings')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('recruitment.add_job')}</Button>} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('recruitment.jobs_load_failed') : undefined}
        emptyMessage={t('recruitment.no_jobs')}
        getRowId={(row) => row._id}
        toolbar={
          <>
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input placeholder={t('recruitment.search_titles')} value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm" />
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-32"><SelectValue placeholder={t('recruitment.status')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('recruitment.all')}</SelectItem>
                <SelectItem value="open">{t('recruitment.open')}</SelectItem>
                <SelectItem value="closed">{t('recruitment.closed')}</SelectItem>
                <SelectItem value="draft">{t('recruitment.draft')}</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recruitment.add_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('recruitment.add_sr')}</DialogDescription>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>{t('recruitment.title_label')}</Label><Input name="title" required /></div>
            <div>
              <Label>{t('recruitment.department_label')}</Label>
              <select name="departmentId" required className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="">{t('recruitment.select_department')}</option>
                {departments?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>{t('recruitment.description_label')}</Label><Input name="description" /></div>
            <div><Label>{t('recruitment.requirements_label')}</Label><Input name="requirements" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('recruitment.status_label')}</Label>
                <select name="status" className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                  <option value="open">{t('recruitment.open')}</option>
                  <option value="closed">{t('recruitment.closed')}</option>
                  <option value="draft">{t('recruitment.draft')}</option>
                </select>
              </div>
              <div><Label>{t('recruitment.openings_label')}</Label><Input name="openings" type="number" min={1} defaultValue={1} /></div>
            </div>
            <Button type="submit" className="w-full">{t('recruitment.create_job')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recruitment.edit_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('recruitment.edit_sr')}</DialogDescription>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>{t('recruitment.title_label')}</Label><Input name="title" defaultValue={editingJob?.title} required /></div>
            <div>
              <Label>{t('recruitment.department_label')}</Label>
              <select name="departmentId" defaultValue={editingJob?.departmentId?._id || editingJob?.departmentId} required className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                {departments?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>{t('recruitment.description_label')}</Label><Input name="description" defaultValue={editingJob?.description} /></div>
            <div><Label>{t('recruitment.requirements_label')}</Label><Input name="requirements" defaultValue={editingJob?.requirements} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('recruitment.status_label')}</Label>
                <select name="status" defaultValue={editingJob?.status} className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                  <option value="open">{t('recruitment.open')}</option>
                  <option value="closed">{t('recruitment.closed')}</option>
                  <option value="draft">{t('recruitment.draft')}</option>
                </select>
              </div>
              <div><Label>{t('recruitment.openings_label')}</Label><Input name="openings" type="number" min={1} defaultValue={editingJob?.openings || 1} /></div>
            </div>
            <Button type="submit" className="w-full">{t('recruitment.update_job')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeletingJob(null); }}
        title={t('recruitment.delete_title')}
        description={<>{t('recruitment.delete_confirm')} <strong>{deletingJob?.title}</strong>? {t('recruitment.delete_warning')}</>}
        confirmLabel={t('recruitment.delete')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (deletingJob) deleteMutation.mutate(deletingJob._id); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
