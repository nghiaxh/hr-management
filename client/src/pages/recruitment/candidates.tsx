import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { recruitmentApi } from '../../api/recruitment';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '../../context/language-context';
import { toast } from '../../hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { Candidate } from '../../types';

const columnHelper = createColumnHelper<Candidate>();

export default function CandidatesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const queryClient = useQueryClient();

  const filterJobPostingId = searchParams.get('jobPostingId') || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', search, statusFilter, filterJobPostingId],
    queryFn: () => recruitmentApi.getCandidates({ search, status: statusFilter || undefined, jobPostingId: filterJobPostingId }),
  });
  const { data: jobPostings } = useQuery({
    queryKey: ['job-postings-list'],
    queryFn: () => recruitmentApi.getJobPostings(),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => recruitmentApi.createCandidate(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); setOpen(false); toast({ title: t('recruitment.candidate_created') }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => recruitmentApi.updateCandidate(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); setEditOpen(false); setEditingCandidate(null); toast({ title: t('recruitment.candidate_updated') }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteCandidate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); setDeleteOpen(false); setDeletingCandidate(null); toast({ title: t('recruitment.candidate_deleted') }); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate(Object.fromEntries(form));
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    updateMutation.mutate({ id: editingCandidate!._id, data: Object.fromEntries(form) });
  };

  const columns = [
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.name')} />,
    }),
    columnHelper.accessor('email', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.email')} />,
    }),
    columnHelper.accessor((row) => (row.jobPostingId as any)?.title || '-', {
      id: 'jobPosting',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.job_posting')} />,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
      filterFn: 'equals',
    }),
    columnHelper.accessor('appliedDate', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('recruitment.applied_date')} />,
      cell: ({ getValue }) => (getValue() ? new Date(getValue() as string).toLocaleDateString() : '-'),
    }),
    columnHelper.display({
      id: 'actions',
      header: t('recruitment.actions'),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingCandidate(row.original); setEditOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeletingCandidate(row.original); setDeleteOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div>
      <PageHeader title={t('recruitment.candidates')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('recruitment.add_candidate')}</Button>} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage={t('recruitment.no_candidates')}
        getRowId={(row) => row._id}
        toolbar={
          <>
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input placeholder={t('recruitment.search_candidates')} value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40 h-10 rounded-lg border bg-background px-3 text-sm">
              <option value="">{t('recruitment.all_statuses')}</option>
              <option value="applied">{t('recruitment.applied')}</option>
              <option value="screening">{t('recruitment.screening')}</option>
              <option value="interview">{t('recruitment.interview')}</option>
              <option value="offered">{t('recruitment.offered')}</option>
              <option value="hired">{t('recruitment.hired')}</option>
              <option value="rejected">{t('recruitment.rejected')}</option>
            </select>
          </>
        }
      />
    </div>
  );
}
