import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/page-header';
import { EmptyState } from '../components/shared/empty-state';
import { Card, CardContent } from '../components/ui/card';
import { useTranslation } from '../context/language-context';
import { departmentsApi } from '../api/departments';
import { SkeletonCard } from '../components/shared/skeleton';
import { Building2, ChevronRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function OrgChartPage() {
  const { t } = useTranslation();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  });

  const deptList = Array.isArray(departments) ? departments : departments?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('org_chart.title')} description={t('org_chart.description')} />
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!deptList.length) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('org_chart.title')} description={t('org_chart.description')} />
        <EmptyState icon={Building2} title={t('departments.no_results')} description={t('departments.no_results_desc')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('org_chart.title')} description={t('org_chart.description')} />

      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

        {deptList.map((dept: any, idx: number) => (
          <div key={dept._id} className={cn('flex', idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end')}>
            <Card className="relative w-full md:w-[45%] hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{dept.name}</p>
                        {dept.managerName && (
                          <p className="text-xs text-muted-foreground">{dept.managerName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Users className="h-3 w-3" />
                      <span>{dept.employeeCount || 0} nhân viên</span>
                    </div>
                  </div>
                  <Link
                    to={`/departments`}
                    className="p-1.5 rounded-md hover:bg-accent/50 transition-colors"
                    aria-label={t('departments.view') || 'Xem'}
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}


