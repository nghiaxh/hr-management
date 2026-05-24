import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LeaveApprovalsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['leaves', 'pending'], queryFn: () => leavesApi.getAll({ status: 'pending' }) });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesApi.updateStatus(id, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => leavesApi.updateStatus(id, { status: 'rejected', rejectionReason: 'Declined' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
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
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((leave: any) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</TableCell>
                  <TableCell className="capitalize">{leave.type}</TableCell>
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell><StatusBadge status={leave.status} /></TableCell>
                  <TableCell className="flex gap-1">
                    {leave.status === 'pending' && <>
                      <Button variant="ghost" size="icon" className="text-green-600" onClick={() => approveMutation.mutate(leave._id)}><CheckCircle className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => rejectMutation.mutate(leave._id)}><XCircle className="h-4 w-4" /></Button>
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t('leaves.no_pending')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
