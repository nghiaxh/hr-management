import { NavLink } from 'react-router';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { notificationsApi } from '../../api/notifications';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Buildings, CalendarCheck, ClipboardText,
  Clock, ChartBar, Wallet, Money, SignOut,
  X, Bell, CaretLeft, GitFork, GearSix,
} from '@phosphor-icons/react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  end?: boolean;
}

const menuItems: MenuItem[] = [
  { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'] },
  { path: '/departments', label: 'nav.departments', icon: Buildings, roles: ['admin', 'manager'] },
  { path: '/org-chart', label: 'org_chart.title', icon: GitFork, roles: ['admin', 'manager'] },
  { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['admin', 'manager', 'employee'], end: true },
  { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardText, roles: ['admin', 'manager'] },
  { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['admin', 'manager', 'employee'], end: true },
  { path: '/attendance/report', label: 'nav.attendance_report', icon: ChartBar, roles: ['admin', 'manager'] },
  { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['admin', 'manager', 'employee'], end: true },
  { path: '/payroll/manage', label: 'nav.payroll_management', icon: Money, roles: ['admin'] },
];

function NavItem({ item, collapsed, onNav }: { item: MenuItem; collapsed: boolean; onNav: () => void }) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNav}
      title={collapsed ? t(item.label) : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center px-2 py-1.5 rounded-lg text-sm transition-colors',
          collapsed ? 'justify-start pl-2.5' : 'gap-2',
          isActive
            ? 'bg-surface-tertiary text-foreground font-medium'
            : 'text-muted hover:text-foreground hover:bg-surface-secondary'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-accent')} />
          {!collapsed && t(item.label)}
        </>
      )}
    </NavLink>
  );
}

function BottomLink({ to, icon: Icon, label, collapsed, onClick, className, children }: {
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const content = (
    <div
      className={cn(
        'flex items-center w-full rounded-lg transition-colors px-2 py-1.5 text-sm cursor-pointer',
        collapsed ? 'justify-start pl-2.5' : 'gap-2',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      title={collapsed ? t(label) : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && t(label)}
      {children}
    </div>
  );

  return to ? <NavLink to={to}>{content}</NavLink> : content;
}

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-1">
        <button onClick={closeMobile} className="p-1 rounded-lg hover:bg-surface-secondary md:hidden cursor-pointer" aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <NavLink to="/profile" onClick={closeMobile} title={collapsed ? (user?.name || user?.email) : undefined} className={cn(
        'flex items-center gap-2 px-2 py-2 rounded-xl text-sm hover:bg-surface-secondary transition-all w-full group',
        collapsed && 'justify-start pl-2.5'
      )}>
        <div className="h-7 w-7 rounded-full bg-surface-tertiary text-foreground flex items-center justify-center text-xs font-semibold shrink-0">
          {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        {!collapsed && (
          <p className="text-sm font-medium truncate leading-tight text-foreground">{user?.name || user?.email}</p>
        )}
      </NavLink>

      <nav className="flex-1 overflow-y-auto space-y-0.5 mt-1 mb-1">
        {visibleItems.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onNav={closeMobile} />
        ))}
      </nav>

      <div className="space-y-0.5 pt-1 border-t border-separator">
        <BottomLink
          to="/notifications"
          icon={Bell}
          label="nav.notifications"
          collapsed={collapsed}
          onClick={closeMobile}
        >
          {(typeof unreadCount === 'number' && unreadCount > 0) && (
            <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-accent-foreground tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </BottomLink>

        <BottomLink
          to="/settings"
          icon={GearSix}
          label="settings"
          collapsed={collapsed}
          onClick={closeMobile}
        />

        <BottomLink
          icon={SignOut}
          label="nav.logout"
          collapsed={collapsed}
          onClick={() => setLogoutOpen(true)}
          className="text-muted hover:text-danger hover:bg-danger-soft"
        />
      </div>

      <button
        onClick={toggleCollapsed}
        className={cn(
          'rounded-lg transition-colors cursor-pointer hover:bg-surface-secondary mt-1 flex items-center justify-center w-full',
          collapsed ? 'p-2' : 'px-2 py-1.5'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <CaretLeft className={cn('h-3.5 w-3.5 text-muted transition-transform', collapsed && 'rotate-180')} />
      </button>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={t('auth.confirm_logout')}
        description={t('auth.confirm_logout_desc')}
        confirmLabel={t('nav.logout')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={logout}
      />
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={closeMobile} />
      )}

      <aside className={cn(
        'bg-background border-r border-separator h-screen py-3 px-2 flex flex-col transition-all duration-300 ease-in-out',
        'md:sticky md:top-0 md:translate-x-0 md:z-auto fixed z-40 top-0 left-0',
        collapsed ? 'w-14' : 'w-56',
        mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
      )}>
        {sidebar}
      </aside>
    </>
  );
}
