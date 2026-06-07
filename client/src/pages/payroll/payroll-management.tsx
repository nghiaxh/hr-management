import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import { employeesApi } from '../../api/employees';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatCurrency } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useTranslation } from '../../context/language-context';
import { Play, CheckCircle, Wallet, TrendingUp, MinusCircle, BadgeDollarSign } from 'lucide-react';

export default function PayrollManagementPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<string | null>(null);
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

  const records = data?.data || [];
  const totalNet = records.filter((r: any) => r.status === 'paid').reduce((s: number, r: any) => s + r.netPay, 0);
  const totalDraft = records.filter((r: any) => r.status === 'draft').reduce((s: number, r: any) => s + r.netPay, 0);

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payroll.management')}
        action={
          <Button onClick={() => setOpen(true)}>
            <Play className="h-4 w-4 mr-1.5" />{t('payroll.process')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.total_paid')}</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalNet)}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.status')}</p>
                <p className="text-xl md:text-2xl font-bold">{records.length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.waiting')}</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalDraft)}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <MinusCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{records.filter((r: any) => r.status === 'draft').length} {t('payroll.employees')?.toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.paid')}</p>
                <p className="text-xl md:text-2xl font-bold">{records.filter((r: any) => r.status === 'paid').length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('payroll.employee')}</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('payroll.period')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.gross')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.bonus')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.deductions')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.net_pay')}</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">{t('payroll.status')}</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">{t('payroll.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted-foreground py-8">{t('payroll.no_records_management')}</td></tr>
              ) : (
                records.map((p: any) => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.employeeId?.firstName} {p.employeeId?.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.month}/{p.year}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(p.basicSalary)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">+{formatCurrency(p.bonus)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">-{formatCurrency(p.deductions)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(p.netPay)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-center">
                      {p.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => setPayTarget(p._id)} className="text-xs">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />{t('payroll.mark_paid')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('payroll.process')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('payroll.process_description')}</DialogDescription>
          <form onSubmit={handleProcess} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('payroll.month')}</Label>
                <Input name="month" type="number" min={1} max={12} required />
              </div>
              <div>
                <Label>{t('payroll.year')}</Label>
                <Input name="year" type="number" min={2020} required />
              </div>
            </div>
            <div>
              <Label>{t('payroll.employees')}</Label>
              <div className="max-h-44 overflow-y-auto rounded-lg border p-2 space-y-1 bg-background/50">
                {employees?.data?.map((emp: any) => (
                  <label key={emp._id} className="flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                    <input type="checkbox" name="employeeIds" value={emp._id} className="rounded" />
                    <span>{emp.firstName} {emp.lastName}</span>
                  </label>
                ))}
                {(!employees?.data || employees.data.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">{t('payroll.no_employees')}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full">{t('payroll.process_btn')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!payTarget}
        onOpenChange={(o) => { if (!o) setPayTarget(null); }}
        title={t('auth.confirm_pay')}
        description={t('auth.confirm_pay_desc')}
        confirmLabel={t('payroll.mark_paid')}
        cancelLabel={t('dialog.cancel')}
        variant="default"
        onConfirm={() => { if (payTarget) payMutation.mutate(payTarget); setPayTarget(null); }}
      />
    </div>
  );
}
