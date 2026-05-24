import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { LogIn, LogOut } from 'lucide-react';

export default function MyAttendancePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll() });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.checkOut(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const today = new Date().toDateString();
  const todayRecord = data?.data?.find((a: any) => new Date(a.date).toDateString() === today);

  return (
    <div>
      <PageHeader title={t('attendance.title')} action={
        !todayRecord?.checkIn ? (
          <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}><LogIn className="h-4 w-4 mr-2" />{t('attendance.check_in')}</Button>
        ) : !todayRecord.checkOut ? (
          <Button onClick={() => checkOutMutation.mutate(todayRecord._id)} disabled={checkOutMutation.isPending}><LogOut className="h-4 w-4 mr-2" />{t('attendance.check_out')}</Button>
        ) : null
      } />

      {todayRecord && (
        <div className="bg-card rounded-lg border p-3 md:p-4 mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>{t('attendance.check_in')}: <strong>{todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '-'}</strong></div>
          <div>{t('attendance.check_out')}: <strong>{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : '-'}</strong></div>
          <div>{t('attendance.status')}: <StatusBadge status={todayRecord.status} /></div>
        </div>
      )}

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('attendance.date')}</TableHead><TableHead>{t('attendance.check_in')}</TableHead><TableHead>{t('attendance.check_out')}</TableHead><TableHead>{t('attendance.status')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((a: any) => (
                <TableRow key={a._id}>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t('attendance.no_records')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
