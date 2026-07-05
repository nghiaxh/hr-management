import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { notificationsApi } from '../../api/notifications';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Building2, CalendarCheck, ClipboardCheck,
  Clock, BarChart3, Wallet, DollarSign, LogOut,
  X, Bell, ChevronLeft, GitGraph, Star, Briefcase, Settings,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const menuItems: MenuItem[] = [
  { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'] },
  { path: '/departments', label: 'nav.departments', icon: Building2, roles: ['admin', 'manager'] },
  { path: '/org-chart', label: 'org_chart.title', icon: GitGraph, roles: ['admin', 'manager'] },
  { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['admin', 'manager', 'employee'] },
  { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardCheck, roles: ['admin', 'manager'] },
  { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['admin', 'manager', 'employee'] },
  { path: '/attendance/report', label: 'nav.attendance_report', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['admin', 'manager', 'employee'] },
  { path: '/payroll/manage', label: 'nav.payroll_management', icon: DollarSign, roles: ['admin'] },
  { path: '/performance-reviews', label: 'nav.performance_reviews', icon: Star, roles: ['admin', 'manager'] },
  { path: '/recruitment', label: 'nav.job_postings', icon: Briefcase, roles: ['admin', 'manager'] },
];

function NavItem({ item, collapsed, onNav }: { item: MenuItem; collapsed: boolean; onNav: () => void }) {
  const { t } = useTranslation();
  const link = (
    <NavLink
      to={item.path}
      onClick={onNav}
      className={({ isActive }) =>
        cn(
          'flex items-center text-sm transition-colors rounded-md',
          collapsed
            ? 'justify-center mx-auto w-9 h-9 p-0'
            : 'gap-2 px-2 py-1.5',
          isActive
            ? collapsed
              ? 'bg-primary/15 text-primary'
              : 'bg-primary/10 text-primary font-medium'
            : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
          {!collapsed && t(item.label)}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">{t(item.label)}</TooltipContent>
    </TooltipRoot>
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
        'flex items-center w-full rounded-md transition-colors text-sm cursor-pointer',
        collapsed
          ? 'justify-center mx-auto w-9 h-9 p-0'
          : 'gap-2 px-2 py-1.5',
        'hover:bg-accent/50',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && t(label)}
      {children}
    </div>
  );

  if (!collapsed) {
    const wrapped = to ? <NavLink to={to}>{content}</NavLink> : content;
    return wrapped;
  }

  const wrapped = to
    ? <NavLink to={to} className="relative">{content}</NavLink>
    : <span className="relative">{content}</span>;

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">{t(label)}</TooltipContent>
    </TooltipRoot>
  );
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
      <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent/50 transition-colors cursor-pointer text-muted-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} />
        </button>
        <button onClick={closeMobile} className="md:hidden p-1 rounded-md hover:bg-accent cursor-pointer" aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <NavLink to="/profile" onClick={closeMobile} className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg text-sm hover:bg-accent/50 transition-all w-full group mt-2',
            collapsed && 'justify-center'
          )}>
            <div className={cn(
              'rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold shrink-0',
              collapsed ? 'h-8 w-8 text-sm' : 'h-7 w-7 text-xs'
            )}>
              {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            {!collapsed && (
              <p className="text-sm font-medium truncate leading-tight">{user?.name || user?.email}</p>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right" className="text-xs">{user?.name || user?.email}</TooltipContent>}
      </TooltipRoot>

      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin mt-3 mb-2">
        {visibleItems.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onNav={closeMobile} />
        ))}
      </nav>

      <div className={cn('space-y-1', collapsed ? 'pt-2' : 'pt-1 border-t border-border')}>
        <BottomLink
          to="/notifications"
          icon={Bell}
          label="nav.notifications"
          collapsed={collapsed}
          onClick={closeMobile}
        >
          {(typeof unreadCount === 'number' && unreadCount > 0) && (
            collapsed
              ? <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive ring-1 ring-background" />
              : (
                <span className="ml-auto h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )
          )}
        </BottomLink>

        <BottomLink
          to="/settings"
          icon={Settings}
          label="settings"
          collapsed={collapsed}
          onClick={closeMobile}
        />

        <BottomLink
          icon={LogOut}
          label="nav.logout"
          collapsed={collapsed}
          onClick={() => setLogoutOpen(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        />
      </div>

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
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={closeMobile} />
      )}

      <aside className={cn(
        'bg-background border-r border-border h-screen py-3 px-2 flex flex-col transition-all duration-300 ease-in-out',
        'md:sticky md:top-0 md:translate-x-0 md:z-auto fixed z-40 top-0 left-0',
        collapsed ? 'w-14' : 'w-56',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      )}>
        {sidebar}
      </aside>
    </>
  );
}
