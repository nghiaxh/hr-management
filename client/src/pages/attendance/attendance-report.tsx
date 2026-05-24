import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatDate } from '../../lib/utils';

export default function AttendanceReportPage() {
  const { data, isLoading } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll() });

  const stats = data?.data?.reduce((acc: any, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Attendance Report" />
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-white rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold capitalize">{v as number}</p>
              <p className="text-sm text-muted-foreground capitalize">{k}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((a: any) => (
                <TableRow key={a._id}>
                  <TableCell>{a.employeeId?.firstName} {a.employeeId?.lastName}</TableCell>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
