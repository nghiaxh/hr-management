import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import { employeesApi } from '../../api/employees';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatCurrency } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useTranslation } from '../../context/language-context';
import { Play, CheckCircle } from 'lucide-react';

export default function PayrollManagementPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll() });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });

  const processMutation = useMutation({
    mutationFn: (d: any) => payrollApi.process(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll'] }); setOpen(false); },
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => payrollApi.pay(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const employeeIds = Array.from(form.getAll('employeeIds') as string[]);
    processMutation.mutate({ employeeIds, month: Number(form.get('month')), year: Number(form.get('year')) });
  };

  return (
    <div>
      <PageHeader title={t('payroll.management')} action={<Button onClick={() => setOpen(true)}><Play className="h-4 w-4 mr-2" />{t('payroll.process')}</Button>} />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('payroll.employee')}</TableHead><TableHead>{t('payroll.period')}</TableHead><TableHead>{t('payroll.net_pay')}</TableHead><TableHead>{t('payroll.status')}</TableHead><TableHead>{t('payroll.actions')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((p: any) => (
                <TableRow key={p._id}>
                  <TableCell>{p.employeeId?.firstName} {p.employeeId?.lastName}</TableCell>
                  <TableCell>{p.month}/{p.year}</TableCell>
                  <TableCell>{formatCurrency(p.netPay)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    {p.status === 'draft' && <Button variant="ghost" size="sm" onClick={() => payMutation.mutate(p._id)}><CheckCircle className="h-4 w-4 mr-1" />{t('payroll.mark_paid')}</Button>}
                  </TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('payroll.no_records_mgmt')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('payroll.process')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Process payroll for selected employees</DialogDescription>
          <form onSubmit={handleProcess} className="space-y-4">
            <div><Label>{t('payroll.month')}</Label><Input name="month" type="number" min={1} max={12} required /></div>
            <div><Label>{t('payroll.year')}</Label><Input name="year" type="number" min={2020} required /></div>
            <div><Label>{t('payroll.employees')}</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {employees?.data?.map((emp: any) => (
                  <label key={emp._id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="employeeIds" value={emp._id} />
                    {emp.firstName} {emp.lastName}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">{t('payroll.process_btn')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
