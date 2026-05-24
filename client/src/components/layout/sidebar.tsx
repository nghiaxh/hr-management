import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, ClipboardCheck,
  Clock, BarChart3, Wallet, DollarSign, LogOut,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { path: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'manager'] },
  { path: '/departments', label: 'Departments', icon: Building2, roles: ['admin', 'manager'] },
  { path: '/leaves', label: 'Leaves', icon: CalendarCheck, roles: ['employee'] },
  { path: '/leaves/approvals', label: 'Leave Approvals', icon: ClipboardCheck, roles: ['admin', 'manager'] },
  { path: '/attendance', label: 'Attendance', icon: Clock, roles: ['employee'] },
  { path: '/attendance/report', label: 'Attendance Report', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/payroll', label: 'Payroll', icon: Wallet, roles: ['employee'] },
  { path: '/payroll/manage', label: 'Payroll Mgmt', icon: DollarSign, roles: ['admin'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 px-2">HR Manager</div>
      <nav className="flex-1 space-y-1">
        {menuItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')
          }>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground mt-auto">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );
}
