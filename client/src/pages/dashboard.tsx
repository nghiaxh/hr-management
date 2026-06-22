import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { dashboardApi } from '../api/dashboard';
import { attendanceApi } from '../api/attendance';
import { StatusBadge } from '../components/shared/status-badge';
import { SkeletonCard, SkeletonTable } from '../components/shared/skeleton';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { formatDate } from '../lib/utils';
import {
  Users, CalendarCheck, Clock, Wallet,
  Building2, FileText, TrendingUp, BarChart3, PieChart, LogIn, LogOut
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

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

  const { data: dash, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    enabled: !!user,
  });

  const queryClient = useQueryClient();
  const { data: attRecords } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll(), enabled: isEmployee });
  const attList = Array.isArray(attRecords) ? attRecords : attRecords?.data || [];
  const today = new Date().toDateString();
  const todayRecord = attList.find((a: any) => new Date(a.date).toDateString() === today);

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Đã chấm công vào lúc ' + new Date().toLocaleTimeString('vi-VN') });
    },
    onError: (err: any) => { toast({ title: err?.response?.data?.message || t('attendance.already_checked_in'), variant: 'destructive' }); },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => attendanceApi.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: t('attendance.checked_out_success') });
    },
    onError: (err: any) => { toast({ title: err?.response?.data?.message || t('attendance.check_out_failed'), variant: 'destructive' }); },
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-center p-8">
        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive text-lg font-bold">!</span>
        </div>
        <p className="text-sm text-muted-foreground">{(queryError as any)?.response?.data?.message || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-muted/60 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/40 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card><CardContent className="p-5"><SkeletonTable rows={4} cols={3} /></CardContent></Card>
          <Card><CardContent className="p-5"><SkeletonTable rows={4} cols={3} /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (isEmployee) {
    const my = dash || { myLeaves: {}, myAttendance: {}, lastPayroll: null, upcomingLeaves: [] };
    const leaves = my.myLeaves || {};
    const att = my.myAttendance || {};
    const leaveData = [
      { name: t('dashboard.approved'), value: leaves.approved || 0 },
      { name: t('dashboard.pending'), value: leaves.pending || 0 },
      { name: t('dashboard.rejected'), value: leaves.rejected || 0 },
    ].filter(d => d.value > 0);
    const attData = [
      { name: t('dashboard.present'), value: att.present || 0 },
      { name: t('dashboard.late'), value: att.late || 0 },
      { name: t('dashboard.half_day'), value: att.halfDay || 0 },
      { name: t('dashboard.absent'), value: att.absent || 0 },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t('dashboard.welcome_back')}</p>
          </div>
          <div className="flex gap-2">
            {!todayRecord?.checkIn ? (
              <Button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}><LogIn className="h-4 w-4 mr-2" />{t('attendance.check_in')}</Button>
            ) : !todayRecord.checkOut ? (
              <Button onClick={() => checkOutMutation.mutate(todayRecord._id)} disabled={checkOutMutation.isPending}><LogOut className="h-4 w-4 mr-2" />{t('attendance.check_out')}</Button>
            ) : null}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-3 md:p-4 flex flex-wrap gap-x-6 gap-y-1 text-sm items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <strong className="text-base tabular-nums">{new Date().toLocaleTimeString('vi-VN')}</strong>
          </div>
          {todayRecord?.checkIn && (
            <div>{t('attendance.check_in')}: <strong>{new Date(todayRecord.checkIn).toLocaleTimeString('vi-VN')}</strong></div>
          )}
          {todayRecord?.checkOut && (
            <div>{t('attendance.check_out')}: <strong>{new Date(todayRecord.checkOut).toLocaleTimeString('vi-VN')}</strong></div>
          )}
          {todayRecord && (
            <div>{t('attendance.status')}: <StatusBadge status={todayRecord.status} /></div>
          )}
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title={t('dashboard.pending_leaves')} value={leaves.pending || 0} icon={FileText} />
          <StatCard title={t('dashboard.approved')} value={leaves.approved || 0} icon={CalendarCheck} />
          <StatCard title={t('dashboard.present_month')} value={att.present || 0} icon={Clock} />
          <StatCard title={t('dashboard.month_days')} value={att.totalDays || 0} subtitle={t('dashboard.attendance_records')} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.leave_breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {leaveData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.no_leave_data')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie data={leaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {leaveData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.attendance_month')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {attData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.no_attendance_data')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={attData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {my.upcomingLeaves?.length > 0 && (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.upcoming_leaves')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {my.upcomingLeaves.map((leave: any) => (
                <div key={leave._id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{leave.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const deptData = dash?.departmentStats?.map((d: any) => ({
    name: d.name || t('dashboard.na'),
    employees: d.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isManager ? t('dashboard.team_overview') : t('dashboard.company_overview')}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('dashboard.total_employees')} value={dash?.totalEmployees || 0} icon={Users} />
        <StatCard title={t('dashboard.pending_leaves')} value={dash?.pendingLeaves || 0} icon={FileText} />
        <StatCard title={t('dashboard.present_today')} value={dash?.presentToday || 0} icon={Clock} />
        <StatCard title={t('dashboard.monthly_payroll')} value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dash?.monthlyPayroll || 0)} subtitle={`${dash?.totalDepartments || 0} ${t('dashboard.departments')}`} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              {t('dashboard.employees_per_dept')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {deptData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.no_department_data')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="employees" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              {t('dashboard.recent_leaves')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {(!dash?.recentLeaves || dash.recentLeaves.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('dashboard.no_leaves')}</p>
              ) : (
                dash.recentLeaves.map((leave: any) => (
                  <div key={leave._id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{leave.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={leave.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.department_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{dash?.departmentName || t('dashboard.na')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.team_size')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{dash?.totalEmployees || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.dept_payroll')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">${((dash?.departmentPayroll || 0) / 1000).toFixed(1)}k</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
