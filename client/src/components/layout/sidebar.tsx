import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { useTheme } from '../../hooks/use-theme';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { notificationsApi } from '../../api/notifications';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, ClipboardCheck,
  Clock, BarChart3, Wallet, DollarSign, LogOut, Sun, Moon,
  User, X, Bell, ChevronLeft, GitGraph, Star, Briefcase, Settings,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
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
  { path: '/recruitment', label: 'nav.job_postings', icon: Briefcase, roles: ['admin'] },
];

function NavItem({ item, collapsed, onNav }: { item: typeof menuItems[0]; collapsed: boolean; onNav: () => void }) {
  const { t } = useTranslation();
  const link = (
    <NavLink
      to={item.path}
      onClick={onNav}
      className={({ isActive }) =>
        cn(
          'flex items-center px-2 py-1.5 rounded-md text-sm transition-colors',
          collapsed ? 'justify-center gap-0' : 'gap-2.5',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
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
      <TooltipContent side="right">{t(item.label)}</TooltipContent>
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
  const { theme, toggleTheme } = useTheme();
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

  function BottomNavItem({ children, label, collapsed: isCollapsed }: { children: React.ReactNode; label: string; collapsed: boolean }) {
    if (!isCollapsed) return <>{children}</>;
    return (
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </TooltipRoot>
    );
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-1">
        <button onClick={closeMobile} className="p-1 rounded-md hover:bg-accent md:hidden cursor-pointer" aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <TooltipRoot>
        <TooltipTrigger asChild>
          <NavLink to="/profile" onClick={closeMobile} className={cn(
            'flex items-center gap-2.5 px-2 py-2 mb-3 rounded-lg text-sm hover:bg-accent/50 transition-all w-full text-left group',
            collapsed && 'justify-center'
          )}>
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
              {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{user?.name || user?.email}</p>
                <p className="text-[11px] text-muted-foreground">{t('role.' + user?.role)}</p>
              </div>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{user?.name || user?.email}</TooltipContent>}
      </TooltipRoot>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} onNav={closeMobile} />
        ))}
      </nav>

      <div className="border-t border-border pt-2 mt-2 space-y-0.5">
        <BottomNavItem label={t('nav.notifications')} collapsed={collapsed}>
          <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) =>
            cn('flex items-center w-full rounded-md transition-colors px-2 py-1.5 text-sm',
              collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left',
              isActive
                ? 'bg-accent font-medium text-foreground'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
            )
          }>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bell className={cn('h-4 w-4', isActive && 'text-foreground')} />
                  {(typeof unreadCount === 'number' && unreadCount > 0) && (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {!collapsed && t('nav.notifications')}
              </>
            )}
          </NavLink>
        </BottomNavItem>

        <BottomNavItem label={t('user.profile')} collapsed={collapsed}>
          <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) =>
            cn('flex items-center w-full rounded-md transition-colors px-2 py-1.5 text-sm',
              collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left',
              isActive
                ? 'bg-accent font-medium text-foreground'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
            )
          }>
            {({ isActive }) => (
              <>
                <User className={cn('h-4 w-4', isActive && 'text-foreground')} />
                {!collapsed && t('user.profile')}
              </>
            )}
          </NavLink>
        </BottomNavItem>

        <BottomNavItem label={t('settings')} collapsed={collapsed}>
          <NavLink to="/settings" onClick={closeMobile} className={({ isActive }) =>
            cn('flex items-center w-full rounded-md transition-colors px-2 py-1.5 text-sm',
              collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left',
              isActive
                ? 'bg-accent font-medium text-foreground'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
            )
          }>
            {({ isActive }) => (
              <>
                <Settings className={cn('h-4 w-4', isActive && 'text-foreground')} />
                {!collapsed && t('settings')}
              </>
            )}
          </NavLink>
        </BottomNavItem>

        <BottomNavItem label={t('nav.logout')} collapsed={collapsed}>
          <button onClick={() => setLogoutOpen(true)} className={cn(
            'flex items-center w-full rounded-md transition-colors px-2 py-1.5 text-sm cursor-pointer',
            collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left',
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
          )} aria-label={t('nav.logout')}>
            <LogOut className="h-4 w-4" />
            {!collapsed && t('nav.logout')}
          </button>
        </BottomNavItem>
      </div>

      <div className={cn('border-t border-border pt-2 mt-2 flex', collapsed ? 'flex-col items-center gap-1' : 'items-center justify-between')}>
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center rounded-md transition-colors text-sm cursor-pointer hover:bg-accent/50',
            collapsed ? 'p-2 justify-center' : 'px-2 py-1.5 gap-2',
            theme === 'dark' ? 'text-amber-400' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={theme === 'light' ? t('theme_dark') : t('theme_light')}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {!collapsed && (theme === 'light' ? t('theme_dark') : t('theme_light'))}
        </button>

        <button
          onClick={toggleCollapsed}
          className={cn(
            'rounded-md transition-colors cursor-pointer hover:bg-accent/50',
            collapsed ? 'p-2' : 'px-2 py-1.5'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('h-4 w-4 text-muted-foreground transition-transform', collapsed && 'rotate-180')} />
        </button>
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
        'bg-background border-r border-border h-screen py-4 px-3 flex flex-col transition-all duration-300 ease-in-out',
        'md:sticky md:top-0 md:translate-x-0 md:z-auto fixed z-40 top-0 left-0',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      )}>
        {sidebar}
      </aside>
    </>
  );
}
