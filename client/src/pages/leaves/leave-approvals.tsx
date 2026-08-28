import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { Leave } from '../../types';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';

const columnHelper = createColumnHelper<Leave>();

export default function LeaveApprovalsPage() {
  const { t } = useTranslation();
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['leaves', 'pending'], queryFn: () => leavesApi.getAll({ status: 'pending' }) });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesApi.updateStatus(id, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setApproveTarget(null);
      toast({ title: t('leaves.approved') });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('leaves.approval_failed'), variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => leavesApi.updateStatus(id, { status: 'rejected', rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setRejectTarget(null);
      setRejectionReason('');
      toast({ title: t('leaves.rejected') });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('leaves.rejection_failed'), variant: 'destructive' }),
  });

  const columns = [
    columnHelper.accessor((row) => `${(row.employeeId as any)?.firstName || ''} ${(row.employeeId as any)?.lastName || ''}`.trim() || '-', {
      id: 'employee',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('leaves.employee')} />,
    }),
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
    columnHelper.display({
      id: 'actions',
      header: t('leaves.actions'),
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'pending' && <>
            <TooltipRoot>
              <TooltipTrigger>
                <Button variant="ghost" size="icon" className="text-muted hover:text-foreground" onClick={(e) => { e.stopPropagation(); setApproveTarget(row.original.id); }} aria-label={t('leaves.approve')}><CheckCircle className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>{t('leaves.approve')}</TooltipContent>
            </TooltipRoot>
            <TooltipRoot>
              <TooltipTrigger>
                <Button variant="ghost" size="icon" className="text-muted hover:text-danger" onClick={(e) => { e.stopPropagation(); setRejectTarget(row.original.id); }} aria-label={t('leaves.decline')}><XCircle className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>{t('leaves.decline')}</TooltipContent>
            </TooltipRoot>
          </>}
        </div>
      ),
    }),
  ];

  return (
    <div>
      <PageHeader title={t('leaves.approvals')} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('leaves.load_failed') : undefined}
        emptyMessage={t('leaves.no_pending')}
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(o) => { if (!o) setApproveTarget(null); }}
        title={t('auth.confirm_approve_leave')}
        description={t('auth.confirm_approve_leave_desc')}
        confirmLabel={t('leaves.approve')}
        cancelLabel={t('dialog.cancel')}
        variant="default"
        onConfirm={() => { if (approveTarget) approveMutation.mutate(approveTarget); }}
        loading={approveMutation.isPending}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectionReason(''); } }}
        title={t('auth.confirm_reject_leave')}
        description={
          <div className="space-y-3 pt-1">
            <p className="text-sm text-muted">{t('auth.confirm_reject_leave_desc')}</p>
            <div>
              <Label>{t('leaves.rejection_reason')}</Label>
              <Input value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder={t('leaves.rejection_placeholder')} />
            </div>
          </div>
        }
        confirmLabel={t('leaves.decline')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (rejectTarget) rejectMutation.mutate({ id: rejectTarget, reason: rejectionReason || t('leaves.declined') }); }}
        loading={rejectMutation.isPending}
      />
    </div>
  );
}
