import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from '../../context/language-context';
import { cn } from '../../lib/utils';
import { Search, Menu, ChevronRight } from 'lucide-react';

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
  '/org-chart': 'org_chart.title',
  '/performance-reviews': 'nav.performance_reviews',
  '/recruitment': 'nav.job_postings',
  '/settings': 'settings',
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
      result.push({ label: t('employees.detail') || 'Chi tiết' });
    }
  }
  return result;
}

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  const breadcrumbs = getBreadcrumbs(location.pathname, t);

  return (
    <header className="h-14 border-b border-border bg-background flex items-center gap-3 px-3 md:px-6 shrink-0">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm text-muted-foreground flex-1 min-w-0">
        {breadcrumbs.map((item, i) => (
          <span key={i} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground transition-colors truncate">{item.label}</Link>
            ) : (
              <span className="text-foreground font-medium truncate">{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      <span className="md:hidden text-sm font-semibold flex-1 truncate">
        {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ''}
      </span>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm text-muted-foreground w-48 lg:w-64">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            className="bg-transparent outline-none border-0 p-0 text-foreground text-sm w-full placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
    </header>
  );
}
