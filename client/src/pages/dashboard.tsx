import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { employeesApi } from '../api/employees';
import { leavesApi } from '../api/leaves';
import { attendanceApi } from '../api/attendance';
import { payrollApi } from '../api/payroll';
import { StatusBadge } from '../components/shared/status-badge';
import { cn } from '../lib/utils';
import {
  Users, CalendarCheck, Clock, Wallet, ArrowRight,
  Building2, FileText, TrendingUp
} from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon }: { title: string; value: string | number; subtitle?: string; icon: any }) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll(), enabled: !isEmployee });
  const { data: leaves } = useQuery({ queryKey: ['leaves'], queryFn: () => leavesApi.getAll(), enabled: !!user });
  const { data: attendance } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll(), enabled: !!user });
  const { data: payroll } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll(), enabled: !!user });

  const attRecords = Array.isArray(attendance) ? attendance : attendance?.data || [];
  const totalEmployees = employees?.data?.length || 0;
  const pendingLeaves = leaves?.data?.filter((l: any) => l.status === 'pending')?.length || 0;
  const presentToday = attRecords.filter((a: any) => a.status === 'present' || a.status === 'late')?.length || 0;
  const totalPayroll = payroll?.data?.reduce((s: number, p: any) => s + p.netPay, 0) || 0;

  const myLeaves = leaves?.data?.filter((l: any) => {
    if (isEmployee && user?._id) return l.employeeId === user._id;
    if (isManager && user?._id) return l.employeeId === user._id;
    return true;
  }) || [];

  const stats = [];
  if (!isEmployee) stats.push({ title: t('dashboard.total_employees'), value: totalEmployees, icon: Users });
  stats.push({ title: t('dashboard.pending_leaves'), value: pendingLeaves, icon: FileText });
  stats.push({ title: t('dashboard.present_today'), value: presentToday, icon: Clock });
  if (!isEmployee) stats.push({ title: t('dashboard.monthly_payroll'), value: `$${(totalPayroll / 1000).toFixed(1)}k`, subtitle: `${payroll?.data?.length || 0} records`, icon: Wallet });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEmployee ? 'Welcome back' : isManager ? 'Team overview' : 'Company overview'}
          </p>
        </div>
      </div>

      <div className={cn(
        'grid gap-3 md:gap-4',
        stats.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
      )}>
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {isEmployee ? t('dashboard.my_leaves') : t('dashboard.recent_leaves')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {(leaves?.data || []).slice(0, 5).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('dashboard.no_leaves')}</p>
              ) : (
                (leaves?.data || []).slice(0, 5).map((leave: any) => (
                  <div key={leave._id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{leave.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              {isEmployee ? <Clock className="h-4 w-4 text-muted-foreground" /> : <TrendingUp className="h-4 w-4 text-muted-foreground" />}
              {isEmployee ? t('dashboard.my_attendance') : t('dashboard.quick_stats')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isEmployee ? (
              <div className="space-y-1">
                {attRecords.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{t('attendance.no_records')}</p>
                ) : (
                  attRecords.slice(0, 5).map((a: any) => (
                    <div key={a._id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                      <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{new Date(a.date).toLocaleDateString()}</p>
                        {a.checkIn && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {a.checkOut && ` — ${new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-3 border-b border-border/40">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.employees')}</p>
                    <p className="text-lg font-bold">{totalEmployees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-border/40">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.departments')}</p>
                    <p className="text-lg font-bold">{employees?.data ? [...new Set(employees.data.map((e: any) => e.departmentId?._id).filter(Boolean))].length : 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{t('dashboard.pending_leaves')}</p>
                    <p className="text-lg font-bold">{pendingLeaves}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
