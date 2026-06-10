import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import { Leave } from '../../types';

const columnHelper = createColumnHelper<Leave>();

export default function LeaveApprovalsPage() {
  const { t } = useTranslation();
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['leaves', 'pending'], queryFn: () => leavesApi.getAll({ status: 'pending' }) });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesApi.updateStatus(id, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('leaves.approval_failed'), variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => leavesApi.updateStatus(id, { status: 'rejected', rejectionReason: t('leaves.declined') }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setApproveTarget(row.original._id); }}><CheckCircle className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRejectTarget(row.original._id); }}><XCircle className="h-4 w-4" /></Button>
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
        emptyMessage={t('leaves.no_pending')}
        getRowId={(row) => row._id}
      />

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(o) => { if (!o) setApproveTarget(null); }}
        title={t('auth.confirm_approve_leave')}
        description={t('auth.confirm_approve_leave_desc')}
        confirmLabel={t('leaves.approve')}
        cancelLabel={t('dialog.cancel')}
        variant="default"
        onConfirm={() => { if (approveTarget) approveMutation.mutate(approveTarget); setApproveTarget(null); }}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(o) => { if (!o) setRejectTarget(null); }}
        title={t('auth.confirm_reject_leave')}
        description={t('auth.confirm_reject_leave_desc')}
        confirmLabel={t('leaves.decline')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (rejectTarget) rejectMutation.mutate(rejectTarget); setRejectTarget(null); }}
      />
    </div>
  );
}
