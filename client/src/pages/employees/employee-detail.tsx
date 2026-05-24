import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { formatDate, formatCurrency } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: emp, isLoading } = useQuery({ queryKey: ['employee', id], queryFn: () => employeesApi.getOne(id!) });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!emp) return <div className="text-center py-8">Employee not found</div>;

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('/employees')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle>{emp.firstName} {emp.lastName}</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-muted-foreground">Position</dt><dd>{emp.position}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Department</dt><dd>{emp.departmentId?.name || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Salary</dt><dd>{formatCurrency(emp.salary)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Hire Date</dt><dd>{formatDate(emp.hireDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{emp.phone || 'N/A'}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{emp.userId?.email || 'N/A'}</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
