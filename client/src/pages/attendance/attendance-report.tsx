import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';

export default function AttendanceReportPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll() });

  const records = Array.isArray(data) ? data : data?.data || [];

  const stats = records.reduce((acc: any, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title={t('attendance.report')} />
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-card rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold capitalize">{v as number}</p>
              <p className="text-sm text-muted-foreground capitalize">{k}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('attendance.employee')}</TableHead><TableHead>{t('attendance.date')}</TableHead><TableHead>{t('attendance.check_in')}</TableHead><TableHead>{t('attendance.check_out')}</TableHead><TableHead>{t('attendance.status')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center">{t('common.loading')}</TableCell></TableRow> :
              records.map((a: any) => (
                <TableRow key={a._id}>
                  <TableCell>{a.employeeId?.firstName} {a.employeeId?.lastName}</TableCell>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
            {records.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('attendance.no_records')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
