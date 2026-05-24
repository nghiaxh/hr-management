import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import { PageHeader } from '../../components/shared/page-header';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatCurrency } from '../../lib/utils';

export default function MyPayrollPage() {
  const { data, isLoading } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll() });

  return (
    <div>
      <PageHeader title="My Payroll" />
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Period</TableHead><TableHead>Basic Salary</TableHead><TableHead>Bonus</TableHead><TableHead>Deductions</TableHead><TableHead>Net Pay</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell>{p.month}/{p.year}</TableCell>
                  <TableCell>{formatCurrency(p.basicSalary)}</TableCell>
                  <TableCell>{formatCurrency(p.bonus)}</TableCell>
                  <TableCell>{formatCurrency(p.deductions)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(p.netPay)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No payroll records</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
