import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { performanceReviewsApi } from '../../api/performance-reviews';
import { employeesApi } from '../../api/employees';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Plus, Pencil } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useTranslation } from '../../context/language-context';
import { PerformanceReview } from '../../types';

const columnHelper = createColumnHelper<PerformanceReview>();

export default function ReviewManagementPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['performance-reviews-management'],
    queryFn: () => performanceReviewsApi.getAll(),
  });
  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => performanceReviewsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['performance-reviews-management'] }); setOpen(false); toast({ title: t('performance_reviews.created') }); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => performanceReviewsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['performance-reviews-management'] }); setEditOpen(false); setEditingReview(null); toast({ title: t('performance_reviews.updated') }); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate(Object.fromEntries(form));
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    updateMutation.mutate({ id: editingReview._id, data: Object.fromEntries(form) });
  };

  const reviews = data?.data || [];
  const avgRating = reviews.filter((r: any) => r.rating).reduce((s: number, r: any) => s + r.rating, 0) / (reviews.filter((r: any) => r.rating).length || 1);
  const submittedCount = reviews.filter((r: any) => r.status === 'submitted' || r.status === 'acknowledged').length;

  const columns = [
    columnHelper.accessor((row) => `${(row.employeeId as any)?.firstName || ''} ${(row.employeeId as any)?.lastName || ''}`.trim() || '-', {
      id: 'employee',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('performance_reviews.employee')} />,
    }),
    columnHelper.accessor('period', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('performance_reviews.period')} />,
    }),
    columnHelper.accessor('rating', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('performance_reviews.rating')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center">{getValue() ? `${getValue()}/5` : '-'}</div>,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('performance_reviews.status_heading')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('performance_reviews.actions_heading'),
      cell: ({ row }) => (
        <div className="text-center">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingReview(row.original); setEditOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('performance_reviews.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('performance_reviews.new_review')}</Button>} />

      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-blue-500" />
          <CardContent className="p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('performance_reviews.total_reviews')}</p>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-amber-500" />
          <CardContent className="p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('performance_reviews.avg_rating')}</p>
            <p className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : t('performance_reviews.na')}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('performance_reviews.submitted')}</p>
            <p className="text-2xl font-bold">{submittedCount}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyMessage={t('performance_reviews.no_reviews_found')}
        getRowId={(row) => row._id}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('performance_reviews.new_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('performance_reviews.new_sr')}</DialogDescription>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>{t('performance_reviews.employee_label')}</Label>
              <select name="employeeId" required className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="">{t('performance_reviews.select_employee')}</option>
                {employees?.data?.map((e: any) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div><Label>{t('performance_reviews.period_label')}</Label><Input name="period" required placeholder={t('performance_reviews.period_placeholder')} /></div>
            <div>
              <Label>{t('performance_reviews.rating_label')}</Label>
              <Input name="rating" type="number" min={1} max={5} />
            </div>
            <div><Label>{t('performance_reviews.comments_label')}</Label><textarea name="comments" className="w-full min-h-24 rounded-lg border bg-background px-3 py-2 text-sm" /></div>
            <div><Label>{t('performance_reviews.goals_label')}</Label><textarea name="goals" className="w-full min-h-24 rounded-lg border bg-background px-3 py-2 text-sm" /></div>
            <Button type="submit" className="w-full">{t('performance_reviews.create_review')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('performance_reviews.edit_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('performance_reviews.edit_sr')}</DialogDescription>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>{t('performance_reviews.rating_label')}</Label>
              <Input name="rating" type="number" min={1} max={5} defaultValue={editingReview?.rating || ''} />
            </div>
            <div><Label>{t('performance_reviews.comments_label')}</Label><textarea name="comments" defaultValue={editingReview?.comments || ''} className="w-full min-h-24 rounded-lg border bg-background px-3 py-2 text-sm" /></div>
            <div><Label>{t('performance_reviews.goals_label')}</Label><textarea name="goals" defaultValue={editingReview?.goals || ''} className="w-full min-h-24 rounded-lg border bg-background px-3 py-2 text-sm" /></div>
            <div>
              <Label>{t('performance_reviews.status_label')}</Label>
              <select name="status" defaultValue={editingReview?.status} className="w-full h-10 rounded-lg border bg-background px-3 text-sm">
                <option value="draft">{t('performance_reviews.draft_status')}</option>
                <option value="submitted">{t('performance_reviews.submitted_status')}</option>
                <option value="acknowledged">{t('performance_reviews.acknowledged')}</option>
              </select>
            </div>
            <Button type="submit" className="w-full">{t('performance_reviews.update_review')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
