import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { useTheme } from '../../hooks/use-theme';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../../hooks/use-toast';
import { authApi } from '../../api/auth';
import { notificationsApi } from '../../api/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, ClipboardCheck,
  Clock, BarChart3, Wallet, DollarSign, LogOut, Sun, Moon, Languages,
  Menu, User, Settings, X, ChevronRight, GitBranch, Bell,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  { path: '/profile', label: 'user.profile', icon: User, roles: ['admin', 'manager', 'employee'] },
  { path: '/employees', label: 'nav.employees', icon: Users, roles: ['admin', 'manager'] },
  { path: '/departments', label: 'nav.departments', icon: Building2, roles: ['admin', 'manager'] },
  { path: '/org-chart', label: 'nav.org_chart', icon: GitBranch, roles: ['admin', 'manager'] },
  { path: '/leaves', label: 'nav.leaves', icon: CalendarCheck, roles: ['employee'] },
  { path: '/leaves/approvals', label: 'nav.leave_approvals', icon: ClipboardCheck, roles: ['admin', 'manager'] },
  { path: '/attendance', label: 'nav.attendance', icon: Clock, roles: ['employee'] },
  { path: '/attendance/report', label: 'nav.attendance_report', icon: BarChart3, roles: ['admin', 'manager'] },
  { path: '/payroll', label: 'nav.payroll', icon: Wallet, roles: ['employee'] },
  { path: '/payroll/manage', label: 'nav.payroll_mgmt', icon: DollarSign, roles: ['admin'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await authApi.updateProfile({ name, email });
      setName(updated.name || '');
      toast({ title: t('profile.updated') });
      setProfileOpen(false);
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end mb-6 px-2">
        <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md hover:bg-accent md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <button onClick={() => setProfileOpen(true)} className="flex items-center gap-3 px-3 py-2 mb-4 rounded-lg text-sm hover:bg-accent transition-colors w-full text-left">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
          {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user?.name || user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
      </button>

      <nav className="flex-1 space-y-1">
        {menuItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
          <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
            cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')
          }>
            <item.icon className="h-4 w-4 shrink-0" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-3 mt-2 space-y-1">
        <NavLink to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left rounded-lg transition-colors">
          <div className="relative">
            <Bell className="h-4 w-4" />
            {(typeof unreadCount === 'number' && unreadCount > 0) && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-[14px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Notifications
        </NavLink>
        <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left rounded-lg transition-colors">
          <Settings className="h-4 w-4" />
          {t('settings')}
        </button>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent w-full text-left rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-40 p-2 rounded-md bg-background border shadow-sm md:hidden">
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'bg-background border-r min-h-screen p-4 flex flex-col transition-transform duration-200',
        'md:relative md:translate-x-0 fixed z-40 top-0 left-0 w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {sidebar}
      </aside>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('user.edit_profile')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Edit user profile</DialogDescription>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div><Label>{t('user.name')}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>{t('user.email')}</Label><Input value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label>{t('user.role')}</Label><Input value={user?.role || ''} disabled /></div>
            <Button type="submit" className="w-full">{t('user.save')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('settings')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Application settings</DialogDescription>
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{t('settings.language')}</span>
              </div>
              <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'vi')} className="text-sm border rounded-md px-3 py-1.5 bg-background">
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                <span className="text-sm font-medium">{t('settings.theme')}</span>
              </div>
              <button onClick={toggleTheme} className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                theme === 'dark' ? 'bg-primary' : 'bg-input',
              )}>
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform',
                  theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-[2px]',
                )} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
