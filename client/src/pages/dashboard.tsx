import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../context/auth-context';
import { employeesApi } from '../api/employees';
import { leavesApi } from '../api/leaves';
import { attendanceApi } from '../api/attendance';
import { payrollApi } from '../api/payroll';
import { StatusBadge } from '../components/shared/status-badge';

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><div className="text-3xl font-bold">{value}</div>{subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll(), enabled: !isEmployee });
  const { data: leaves } = useQuery({ queryKey: ['leaves'], queryFn: () => leavesApi.getAll(), enabled: !!user });
  const { data: attendance } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll(), enabled: !!user });
  const { data: payroll } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll(), enabled: !!user });

  const totalEmployees = employees?.data?.length || 0;
  const pendingLeaves = leaves?.data?.filter((l: any) => l.status === 'pending')?.length || 0;
  const presentToday = attendance?.data?.filter((a: any) => a.status === 'present' || a.status === 'late')?.length || 0;
  const totalPayroll = payroll?.data?.reduce((s: number, p: any) => s + p.netPay, 0) || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!isEmployee && <StatCard title="Total Employees" value={totalEmployees} />}
        <StatCard title="Pending Leaves" value={pendingLeaves} />
        <StatCard title="Present Today" value={presentToday} />
        {!isEmployee && <StatCard title="Monthly Payroll" value={`$${totalPayroll.toLocaleString()}`} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Leaves</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaves?.data?.slice(0, 5).map((leave: any) => (
                <div key={leave._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="text-sm font-medium capitalize">{leave.type} Leave</p>
                    <p className="text-xs text-muted-foreground">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
              {(!leaves?.data || leaves.data.length === 0) && <p className="text-sm text-muted-foreground">No leaves found</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isEmployee ? (
                <>
                  <p className="text-sm">My Leaves: <strong>{pendingLeaves} pending</strong></p>
                  <p className="text-sm">My Attendance: <strong>{presentToday} days</strong></p>
                </>
              ) : (
                <>
                  <p className="text-sm">Employees: <strong>{totalEmployees}</strong></p>
                  <p className="text-sm">Departments: <strong>{employees?.meta?.total || 0}</strong></p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
