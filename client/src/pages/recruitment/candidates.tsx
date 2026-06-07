import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../../api/recruitment';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/shared/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '../../context/language-context';
import { toast } from '../../hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

export default function CandidatesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<any>(null);
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
    updateMutation.mutate({ id: editingCandidate._id, data: Object.fromEntries(form) });
  };

  return (
    <div>
      <PageHeader title={t('recruitment.candidates')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('recruitment.add_candidate')}</Button>} />
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('recruitment.search_candidates')} value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40 h-10 rounded-lg border bg-background px-3 text-sm">
          <option value="">{t('recruitment.all_statuses')}</option>
          <option value="applied">{t('recruitment.applied')}</option>
          <option value="screening">{t('recruitment.screening')}</option>
          <option value="interview">{t('recruitment.interview')}</option>
          <option value="offered">{t('recruitment.offered')}</option>
          <option value="hired">{t('recruitment.hired')}</option>
          <option value="rejected">{t('recruitment.rejected')}</option>
        </select>
      </div>
      <div className="bg-card rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('recruitment.name')}</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('recruitment.email')}</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('recruitment.job_posting')}</th>
              <th className="text-center font-medium text-muted-foreground px-4 py-3">{t('recruitment.status')}</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('recruitment.applied_date')}</th>
              <th className="text-center font-medium text-muted-foreground px-4 py-3">{t('recruitment.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{t('recruitment.loading')}</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{t('recruitment.no_candidates')}</td></tr>
            ) : (
              data?.data?.map((c: any) => (
                <tr key={c._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.jobPostingId?.title || '-'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.appliedDate ? new Date(c.appliedDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCandidate(c); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setDeletingCandidate(c); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recruitment.add_candidate_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('recruitment.add_candidate_sr')}</DialogDescription>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('recruitment.first_name')}</Label><Input name="firstName" required /></div>
              <div><Label>{t('recruitment.last_name')}</Label><Input name="lastName" required /></div>
            </div>
            <div><Label>{t('recruitment.email_label')}</Label><Input name="email" type="email" required /></div>
            <div><Label>{t('recruitment.phone_label')}</Label><Input name="phone" /></div>
            <div>
              <Label>{t('recruitment.job_posting_label')}</Label>
              <select name="jobPostingId" required className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="">{t('recruitment.select_job')}</option>
                {jobPostings?.data?.map((j: any) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
            <div><Label>{t('recruitment.notes_label')}</Label><Input name="notes" /></div>
            <Button type="submit" className="w-full">{t('recruitment.create_candidate')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recruitment.edit_candidate_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('recruitment.edit_candidate_sr')}</DialogDescription>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('recruitment.first_name')}</Label><Input name="firstName" defaultValue={editingCandidate?.firstName} required /></div>
              <div><Label>{t('recruitment.last_name')}</Label><Input name="lastName" defaultValue={editingCandidate?.lastName} required /></div>
            </div>
            <div><Label>{t('recruitment.email_label')}</Label><Input name="email" type="email" defaultValue={editingCandidate?.email} required /></div>
            <div><Label>{t('recruitment.phone_label')}</Label><Input name="phone" defaultValue={editingCandidate?.phone} /></div>
            <div>
              <Label>{t('recruitment.status')}</Label>
              <select name="status" defaultValue={editingCandidate?.status} className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="applied">{t('recruitment.applied')}</option>
                <option value="screening">{t('recruitment.screening')}</option>
                <option value="interview">{t('recruitment.interview')}</option>
                <option value="offered">{t('recruitment.offered')}</option>
                <option value="hired">{t('recruitment.hired')}</option>
                <option value="rejected">{t('recruitment.rejected')}</option>
              </select>
            </div>
            <div><Label>{t('recruitment.notes_label')}</Label><Input name="notes" defaultValue={editingCandidate?.notes} /></div>
            <Button type="submit" className="w-full">{t('recruitment.update_candidate')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recruitment.delete_candidate_title')}</DialogTitle></DialogHeader>
          <DialogDescription>{t('recruitment.delete_candidate_confirm')} <strong>{deletingCandidate?.firstName} {deletingCandidate?.lastName}</strong>?</DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('recruitment.cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deletingCandidate._id)}>{t('recruitment.delete')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
