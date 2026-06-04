import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '../api/departments';
import { PageHeader } from '../components/shared/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useTranslation } from '../context/language-context';
import { Building2, User, Users } from 'lucide-react';

export default function OrgChartPage() {
  const { t } = useTranslation();
  const { data: orgData, isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => departmentsApi.getOrgChart(),
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  const departments = Array.isArray(orgData) ? orgData : [];

  return (
    <div>
      <PageHeader title="Organization Chart" />
      <div className="grid gap-6 md:grid-cols-2">
        {departments.map((dept: any) => (
          <Card key={dept._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                {dept.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dept.description && (
                <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
              )}
              {dept.manager && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">{dept.manager.name || dept.manager.email}</span>
                    <span className="text-muted-foreground ml-2">({t('departments.manager')})</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{dept.employeeCount} employees</span>
              </div>
              {dept.employees?.length > 0 && (
                <div className="space-y-1 ml-6 border-l-2 border-border pl-4">
                  {dept.employees.map((emp: any) => (
                    <div key={emp._id} className="flex items-center gap-2 py-1 text-sm">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                      <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                      <span className="text-muted-foreground">- {emp.position}</span>
                    </div>
                  ))}
                </div>
              )}
              {(!dept.employees || dept.employees.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No employees</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {departments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No departments found</p>
      )}
    </div>
  );
}
