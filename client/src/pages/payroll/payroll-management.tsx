import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { payrollApi } from '../../api/payroll';
import { employeesApi } from '../../api/employees';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { formatCurrency } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { toast } from '../../hooks/use-toast';
import { useTranslation } from '../../context/language-context';
import { Play, CheckCircle } from '@phosphor-icons/react';
import { Payroll } from '../../types';

const columnHelper = createColumnHelper<Payroll>();

export default function PayrollManagementPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll() });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });

  const processMutation = useMutation({
    mutationFn: (d: any) => payrollApi.process(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll'] }); setOpen(false); toast({ title: t('payroll.processed') }); },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('payroll.process_failed'), variant: 'destructive' }),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => payrollApi.pay(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payroll'] }); setPayTarget(null); toast({ title: t('payroll.marked_paid') }); },
    onError: (err: any) => { setPayTarget(null); toast({ title: err?.response?.data?.message || t('payroll.pay_failed'), variant: 'destructive' }); },
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
  const paidCount = records.filter((r: any) => r.status === 'paid').length;
  const draftCount = records.filter((r: any) => r.status === 'draft').length;

  const columns = [
    columnHelper.accessor((row) => `${(row.employeeId as any)?.firstName || ''} ${(row.employeeId as any)?.lastName || ''}`.trim() || '-', {
      id: 'employee',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.employee')} />,
    }),
    columnHelper.accessor((row) => `${row.month}/${row.year}`, {
      id: 'period',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.period')} />,
    }),
    columnHelper.accessor('basicSalary', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.basic_salary')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted">{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('socialInsurance', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.social_insurance')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted">-{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('pit', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.pit')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted">-{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('totalDeductions', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.total_deductions')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-danger font-medium">-{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('netPay', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.net_pay')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right font-bold">{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('payroll.actions'),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPayTarget(row.original.id); }} className="text-xs">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />{t('payroll.mark_paid')}
            </Button>
          )}
        </div>
      ),
    }),
  ];

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-success" />
          <CardContent className="space-y-0.5">
            <p className="text-xs text-muted font-medium">{t('payroll.total_paid')}</p>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalNet)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-foreground/60" />
          <CardContent className="space-y-0.5">
            <p className="text-xs text-muted font-medium">{t('payroll.status')}</p>
            <p className="text-xl md:text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-warning" />
          <CardContent className="space-y-0.5">
            <p className="text-xs text-muted font-medium">{t('payroll.waiting')}</p>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalDraft)}</p>
            <p className="text-xs text-muted">{draftCount} {t('payroll.employees')?.toLowerCase()}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-foreground" />
          <CardContent className="space-y-0.5">
            <p className="text-xs text-muted font-medium">{t('payroll.paid')}</p>
            <p className="text-xl md:text-2xl font-bold">{paidCount}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('payroll.load_failed') : undefined}
        emptyMessage={t('payroll.no_records_management')}
        getRowId={(row) => row.id}
      />

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
              <div className="max-h-44 overflow-y-auto rounded-lg border border-border p-2 space-y-1 bg-surface-secondary/50">
                {employees?.data?.map((emp: any) => (
                  <label key={emp.id} className="flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-md hover:bg-surface-tertiary transition-colors cursor-pointer">
                    <input type="checkbox" name="employeeIds" value={emp.id} className="rounded" />
                    <span>{emp.firstName} {emp.lastName}</span>
                  </label>
                ))}
                {(!employees?.data || employees.data.length === 0) && (
                  <p className="text-xs text-muted text-center py-4">{t('payroll.no_employees')}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={processMutation.isPending}>{processMutation.isPending ? t('payroll.processing') : t('payroll.process_btn')}</Button>
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
        onConfirm={() => { if (payTarget) payMutation.mutate(payTarget); }}
      />
    </div>
  );
}
