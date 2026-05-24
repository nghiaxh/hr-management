import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatDate } from '../../lib/utils';
import { LogIn, LogOut } from 'lucide-react';

export default function MyAttendancePage() {
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
      <PageHeader title="My Attendance" action={
        !todayRecord?.checkIn ? (
          <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}><LogIn className="h-4 w-4 mr-2" />Check In</Button>
        ) : !todayRecord.checkOut ? (
          <Button onClick={() => checkOutMutation.mutate(todayRecord._id)} disabled={checkOutMutation.isPending}><LogOut className="h-4 w-4 mr-2" />Check Out</Button>
        ) : null
      } />

      {todayRecord && (
        <div className="bg-white rounded-lg border p-4 mb-4 flex gap-6 text-sm">
          <div>Check In: <strong>{todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '-'}</strong></div>
          <div>Check Out: <strong>{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : '-'}</strong></div>
          <div>Status: <StatusBadge status={todayRecord.status} /></div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Check In</TableHead><TableHead>Check Out</TableHead><TableHead>Status</TableHead></TableRow>
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
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
