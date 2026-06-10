import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createColumnHelper } from '@tanstack/react-table';
import { leavesApi } from '../../api/leaves';
import { leaveBalanceApi } from '../../api/leave-balance';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { StatusBadge } from '../../components/shared/status-badge';
import { SkeletonCard } from '../../components/shared/skeleton';
import { useTranslation } from '../../context/language-context';
import { useAuth } from '../../context/auth-context';
import { employeesApi } from '../../api/employees';
import { toast } from '../../hooks/use-toast';
import { Plus } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Leave } from '../../types';

const MAX_LEAVE_DAYS = 30;

const columnHelper = createColumnHelper<Leave>();

function daysBetween(start: string, end: string) {
  const s = new Date(start), e = new Date(end);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function MyLeavesPage() {
  const { t } = useTranslation();

  const leaveSchema = z.object({
    type: z.enum(['annual', 'sick', 'personal']),
    startDate: z.string().min(1, t('validation.start_date_required')),
    endDate: z.string().min(1, t('validation.end_date_required')),
    reason: z.string().optional(),
  }).refine(data => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  }, { message: t('validation.end_after_start'), path: ['endDate'] }).refine(data => {
    if (!data.startDate || !data.endDate) return true;
    return daysBetween(data.startDate, data.endDate) <= MAX_LEAVE_DAYS;
  }, { message: `${t('validation.max_leave_days')} ${MAX_LEAVE_DAYS}.`, path: ['endDate'] });

type LeaveForm = z.infer<typeof leaveSchema>;

  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['leaves'], queryFn: () => leavesApi.getAll() });

  const { data: employee } = useQuery({
    queryKey: ['my-employee'],
    queryFn: async () => {
      const emp = await employeesApi.getAll();
      return emp.data?.find((e: any) => e.userId?._id === user?.id || e.userId === user?.id);
    },
    enabled: !!user?.id,
  });

  const { data: balance } = useQuery({
    queryKey: ['leave-balance', employee?._id],
    queryFn: () => leaveBalanceApi.getByEmployee(employee!._id),
    enabled: !!employee?._id,
  });

  const createMutation = useMutation({
    mutationFn: (d: LeaveForm) => leavesApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      setOpen(false);
      reset();
      toast({ title: t('leaves.created') });
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('leaves.create_failed'), variant: 'destructive' });
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
  });

  const balanceItems = balance ? [
    { label: t('leaves.annual_leave'), used: balance.annualUsed, total: balance.annualTotal },
    { label: t('leaves.sick_leave'), used: balance.sickUsed, total: balance.sickTotal },
    { label: t('leaves.personal_leave'), used: balance.personalUsed, total: balance.personalTotal },
  ] : [];

  const columns = [
    columnHelper.accessor('type', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.type')} />,
      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span>,
    }),
    columnHelper.accessor('startDate', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.start')} />,
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('endDate', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.end')} />,
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
    columnHelper.accessor('reason', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.reason')} />,
      cell: ({ getValue }) => getValue() || '-',
    }),
  ];

  return (
    <div>
      <PageHeader title={t('leaves.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('leaves.request')}</Button>} />

      {balanceItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {balanceItems.map((item) => {
            const remaining = item.total - item.used;
            const pct = item.total > 0 ? (item.used / item.total) * 100 : 0;
            return (
              <Card key={item.label}>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold mt-1">{remaining} <span className="text-sm font-normal text-muted-foreground">/ {item.total} {t('leaves.days')}</span></p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('leaves.load_failed') : undefined}
        emptyMessage={t('leaves.no_results')}
        getRowId={(row) => row._id}
      />

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('leaves.request_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('leaves.submit_sr')}</DialogDescription>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <Label>{t('leaves.type')}</Label>
              <select {...register('type')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="annual">{t('leaves.annual')}</option>
                <option value="sick">{t('leaves.sick')}</option>
                <option value="personal">{t('leaves.personal')}</option>
              </select>
              {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label>{t('leaves.start_date')}</Label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label>{t('leaves.end_date')}</Label>
              <Input type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}
            </div>
            <div>
              <Label>{t('leaves.reason')}</Label>
              <Input {...register('reason')} />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('leaves.submitting') : t('leaves.submit')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
