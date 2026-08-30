import { useLocation, Link } from 'react-router';
import { useTranslation } from '../../context/language-context';
import { useTheme } from '../../hooks/use-theme';
import { Button } from '../../components/ui/button';
import { List, CaretRight, Sun, Moon } from '@phosphor-icons/react';

const breadcrumbMap: Record<string, string> = {
  '/employees': 'nav.employees',
  '/departments': 'nav.departments',
  '/leaves': 'nav.leaves',
  '/leaves/approvals': 'nav.leave_approvals',
  '/attendance': 'nav.attendance',
  '/attendance/report': 'nav.attendance_report',
  '/payroll': 'nav.payroll',
  '/payroll/manage': 'nav.payroll_management',
  '/notifications': 'nav.notifications',
  '/profile': 'user.profile',
};

function getBreadcrumbs(pathname: string, t: (key: string) => string) {
  if (pathname === '/login') return [];
  const segments = pathname.split('/').filter(Boolean);
  const result: { label: string; href?: string }[] = [];
  let accumulated = '';
  for (let i = 0; i < segments.length; i++) {
    accumulated += '/' + segments[i];
    const mapped = breadcrumbMap[accumulated];
    if (mapped) {
      result.push({ label: t(mapped), href: i < segments.length - 1 ? accumulated : undefined });
    } else if (i === segments.length - 1) {
      result.push({ label: t('employees.detail') || 'Detail' });
    }
  }
  return result;
}

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  const breadcrumbs = getBreadcrumbs(location.pathname, t);

  return (
    <header className="h-14 border-b border-separator bg-background flex items-center gap-3 px-3 md:px-6 shrink-0">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <List className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm text-muted flex-1 min-w-0">
        {breadcrumbs.map((item, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <CaretRight className="h-3.5 w-3.5 shrink-0" />}
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground transition-colors truncate">{item.label}</Link>
            ) : (
              <span className="text-foreground font-medium truncate">{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      <span className="md:hidden text-sm font-semibold flex-1 truncate text-foreground">
        {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ''}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onPress={toggleTheme}
        aria-label={isDark ? t('settings.light') : t('settings.dark')}
        title={isDark ? t('settings.light') : t('settings.dark')}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}
