import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { LogIn, LogOut } from 'lucide-react';
import { Attendance } from '../../types';

const columnHelper = createColumnHelper<Attendance>();

export default function MyAttendancePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll() });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['attendance'] });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => { refresh(); toast({ title: t('attendance.checked_in') }); },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('attendance.already_checked_in'), variant: 'destructive' });
      refresh();
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.checkOut(id),
    onSuccess: () => { refresh(); toast({ title: t('attendance.checked_out') }); },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('attendance.check_out_failed'), variant: 'destructive' });
      refresh();
    },
  });

  const records = Array.isArray(data) ? data : data?.data || [];
  const today = new Date().toDateString();
  const todayRecord = records.find((a: any) => new Date(a.date).toDateString() === today);

  const columns = [
    columnHelper.accessor('date', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.date')} />,
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('checkIn', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.check_in')} />,
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleTimeString('vi-VN') : '-',
    }),
    columnHelper.accessor('checkOut', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.check_out')} />,
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleTimeString('vi-VN') : '-',
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
  ];

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
          <div>{t('attendance.check_in')}: <strong>{todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString('vi-VN') : '-'}</strong></div>
          <div>{t('attendance.check_out')}: <strong>{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString('vi-VN') : '-'}</strong></div>
          <div>{t('attendance.status')}: <StatusBadge status={todayRecord.status} /></div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('attendance.load_failed') : undefined}
        emptyMessage={t('attendance.no_records')}
        getRowId={(row) => row._id}
      />
    </div>
  );
}
