import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { CheckCircle, XCircle } from 'lucide-react';

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

  return (
    <div>
      <PageHeader title={t('leaves.approvals')} />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('leaves.employee')}</TableHead><TableHead>{t('leaves.type')}</TableHead><TableHead>{t('leaves.start')}</TableHead><TableHead>{t('leaves.end')}</TableHead><TableHead>{t('leaves.status')}</TableHead><TableHead>{t('leaves.actions')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center">{t('leaves.loading')}</TableCell></TableRow> :
              data?.data?.map((leave: any) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</TableCell>
                  <TableCell className="capitalize">{leave.type}</TableCell>
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell><StatusBadge status={leave.status} /></TableCell>
                  <TableCell className="flex gap-1">
                    {leave.status === 'pending' && <>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setApproveTarget(leave._id)}><CheckCircle className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setRejectTarget(leave._id)}><XCircle className="h-4 w-4" /></Button>
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('leaves.no_pending')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

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
