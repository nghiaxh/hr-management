import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../../api/payroll';
import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent } from '../../components/ui/card';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatCurrency } from '../../lib/utils';
import { Wallet, TrendingUp, MinusCircle, BadgeDollarSign } from 'lucide-react';

export default function MyPayrollPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll() });

  const records = data?.data || [];
  const totalPaid = records.filter((r: any) => r.status === 'paid').reduce((s: number, r: any) => s + r.netPay, 0);

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={t('payroll.title')} description={t('payroll.period')} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.total_paid')}</p>
                <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalPaid)}</p>
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
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.paid')}</p>
                <p className="text-xl md:text-2xl font-bold">{records.filter((r: any) => r.status === 'paid').length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{t('payroll.waiting')}</p>
                <p className="text-xl md:text-2xl font-bold">{records.filter((r: any) => r.status === 'draft').length}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center">
                <MinusCircle className="h-5 w-5 text-muted-foreground" />
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
                <th className="text-left font-medium text-muted-foreground px-4 py-3">{t('payroll.period')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.gross')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.bonus')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.deductions')}</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">{t('payroll.net_pay')}</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">{t('payroll.status')}</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-8">{t('payroll.no_records')}</td></tr>
              ) : (
                records.map((p: any) => (
                  <tr key={p._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.month}/{p.year}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(p.basicSalary)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">+{formatCurrency(p.bonus)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">-{formatCurrency(p.deductions)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(p.netPay)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
