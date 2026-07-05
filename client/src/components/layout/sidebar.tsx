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
  User, X, Bell, ChevronLeft, GitGraph, Star, Briefcase, Settings,
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    label: 'nav.section_management',
    items: [
      { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'] },
      { path: '/departments', label: 'nav.departments', icon: Building2, roles: ['admin', 'manager'] },
      { path: '/org-chart', label: 'org_chart.title', icon: GitGraph, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'nav.section_time_off',
    items: [
      { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['admin', 'manager', 'employee'] },
      { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardCheck, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'nav.section_attendance',
    items: [
      { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['admin', 'manager', 'employee'] },
      { path: '/attendance/report', label: 'nav.attendance_report', icon: BarChart3, roles: ['admin', 'manager'] },
    ],
  },
  {
    label: 'nav.section_finance',
    items: [
      { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['admin', 'manager', 'employee'] },
      { path: '/payroll/manage', label: 'nav.payroll_management', icon: DollarSign, roles: ['admin'] },
    ],
  },
  {
    label: 'nav.section_people',
    items: [
      { path: '/performance-reviews', label: 'nav.performance_reviews', icon: Star, roles: ['admin', 'manager'] },
      { path: '/recruitment', label: 'nav.job_postings', icon: Briefcase, roles: ['admin', 'manager'] },
    ],
  },
];

function NavItem({ item, collapsed, onNav }: { item: MenuItem; collapsed: boolean; onNav: () => void }) {
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
        'flex items-center w-full rounded-md transition-colors px-2 py-1.5 text-sm cursor-pointer',
        collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left',
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

  if (!collapsed) return to ? <NavLink to={to}>{content}</NavLink> : content;

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        {to ? <NavLink to={to}>{content}</NavLink> : <span>{content}</span>}
      </TooltipTrigger>
      <TooltipContent side="right">{t(label)}</TooltipContent>
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
            'flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg text-sm hover:bg-accent/50 transition-all w-full text-left group',
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

      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => item.roles.includes(user?.role || ''));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-2 pt-2 pb-0.5 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {t(section.label)}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItem key={item.path} item={item} collapsed={collapsed} onNav={closeMobile} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border pt-2 mt-1 space-y-0.5">
        <BottomLink
          to="/notifications"
          icon={Bell}
          label="nav.notifications"
          collapsed={collapsed}
          onClick={closeMobile}
          className={undefined}
        >
          {(typeof unreadCount === 'number' && unreadCount > 0) && (
            <span className="ml-auto h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </BottomLink>

        <BottomLink
          to="/settings"
          icon={Settings}
          label="settings"
          collapsed={collapsed}
          onClick={closeMobile}
          className={undefined}
        />

        <span>
          <BottomLink
            icon={LogOut}
            label="nav.logout"
            collapsed={collapsed}
            onClick={() => setLogoutOpen(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          />
        </span>
      </div>

      <div className={cn('border-t border-border pt-2 mt-2 flex', collapsed ? 'flex-col items-center gap-1' : 'items-center justify-center')}>
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
