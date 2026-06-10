import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { useTheme } from '../../hooks/use-theme';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { notificationsApi } from '../../api/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, ClipboardCheck,
  Clock, BarChart3, Wallet, DollarSign, LogOut, Sun, Moon, Languages,
  Menu, User, Settings, X, GitBranch, Bell, Briefcase, UserCheck, Star, ChevronLeft,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'] },
  { path: '/departments', label: 'nav.departments', icon: Building2, roles: ['admin', 'manager'] },
  { path: '/org-chart', label: 'nav.org_chart', icon: GitBranch, roles: ['admin', 'manager'] },
  { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['employee'] },
  { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardCheck, roles: ['admin', 'manager'] },
  { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['employee'] },
  { path: '/attendance/report', label: 'nav.attendance_report', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['employee'] },
  { path: '/payroll/manage', label: 'nav.payroll_management', icon: DollarSign, roles: ['admin'] },
  { path: '/recruitment/job-postings', label: 'nav.job_postings', icon: Briefcase, roles: ['admin', 'manager'] },
  { path: '/recruitment/candidates', label: 'nav.candidates', icon: UserCheck, roles: ['admin', 'manager'] },
  { path: '/performance-reviews', label: 'nav.performance_reviews', icon: Star, roles: ['employee'] },
  { path: '/performance-reviews/manage', label: 'nav.performance_management', icon: Star, roles: ['admin', 'manager'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  const queryClient = useQueryClient();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-1">
        <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md hover:bg-accent md:hidden cursor-pointer" aria-label="Close sidebar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-2.5 px-2 py-2 mb-3 rounded-lg text-sm hover:bg-accent/50 transition-all w-full text-left group', collapsed && 'justify-center')}>
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

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
            cn('flex items-center px-2 py-1.5 rounded-lg text-sm transition-all duration-150 relative',
              collapsed ? 'justify-center gap-0' : 'gap-2.5',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
            )
          }>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-primary" />}
                <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'scale-110')} />
                {!collapsed && t(item.label)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border/50 pt-2 mt-2 space-y-0.5">
        <NavLink to="/notifications" onClick={() => setMobileOpen(false)} className={cn('flex items-center px-2 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-accent/50 w-full rounded-lg transition-all', collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left')}>
          <div className="relative">
            <Bell className="h-4 w-4" />
            {(typeof unreadCount === 'number' && unreadCount > 0) && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && t('nav.notifications')}
        </NavLink>
        <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={cn('flex items-center px-2 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-accent/50 w-full rounded-lg transition-all', collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left')}>
          <User className="h-4 w-4" />
          {!collapsed && t('user.profile')}
        </NavLink>
        <button onClick={() => setSettingsOpen(true)} className={cn('flex items-center px-2 py-1.5 text-sm text-foreground/70 hover:text-foreground hover:bg-accent/50 w-full rounded-lg transition-all cursor-pointer', collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left')} aria-label={t('settings')}>
          <Settings className="h-4 w-4" />
          {!collapsed && t('settings')}
        </button>
        <button onClick={() => setLogoutOpen(true)} className={cn('flex items-center px-2 py-1.5 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full rounded-lg transition-all cursor-pointer', collapsed ? 'justify-center gap-0' : 'gap-2.5 text-left')} aria-label={t('nav.logout')}>
          <LogOut className="h-4 w-4" />
          {!collapsed && t('nav.logout')}
        </button>
      </div>

      <button onClick={toggleCollapsed} className="hidden md:flex items-center justify-center gap-2.5 px-2 py-1.5 mt-2 text-sm text-foreground/50 hover:text-foreground hover:bg-accent/50 w-full text-left rounded-lg transition-all cursor-pointer border-t border-border/50 pt-2" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
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
      <button onClick={() => setMobileOpen(true)} className="fixed top-3 left-3 z-40 p-2 rounded-xl bg-background/80 backdrop-blur-xl border shadow-sm md:hidden hover:bg-accent/50 transition-all cursor-pointer" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'glass h-screen py-4 px-3 flex flex-col transition-all duration-300 ease-in-out',
        'md:sticky md:top-0 md:translate-x-0 fixed z-40 top-0 left-0 border-r',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
      )}>
        {sidebar}
      </aside>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('settings')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('settings.sr')}</DialogDescription>
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{t('settings.language')}</span>
              </div>
              <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'vi')} className="text-sm border rounded-md px-3 py-1.5 bg-background">
                <option value="en">{t('settings.english')}</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                <span className="text-sm font-medium">{t('settings.theme')}</span>
              </div>
              <button onClick={toggleTheme} className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                theme === 'dark' ? 'bg-primary' : 'bg-input',
              )}>
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform',
                  theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5',
                )} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
