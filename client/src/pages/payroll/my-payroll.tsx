import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { payrollApi } from '../../api/payroll';
import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent } from '../../components/ui/card';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatCurrency } from '../../lib/utils';
import { Payroll } from '../../types';

const columnHelper = createColumnHelper<Payroll>();

export default function MyPayrollPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['payroll'], queryFn: () => payrollApi.getAll() });

  const records = data?.data || [];
  const totalPaid = records.filter((r: any) => r.status === 'paid').reduce((s: number, r: any) => s + r.netPay, 0);
  const paidCount = records.filter((r: any) => r.status === 'paid').length;
  const draftCount = records.filter((r: any) => r.status === 'draft').length;

  const columns = [
    columnHelper.accessor((row) => `${row.month}/${row.year}`, {
      id: 'period',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.period')} />,
    }),
    columnHelper.accessor('basicSalary', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.gross')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted-foreground">{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('bonus', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.bonus')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted-foreground">+{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('deductions', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.deductions')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right text-muted-foreground">-{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('netPay', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.net_pay')} className="justify-end" />,
      cell: ({ getValue }) => <div className="text-right font-bold">{formatCurrency(getValue())}</div>,
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('payroll.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t('payroll.title')} description={t('payroll.period')} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-emerald-500" />
          <CardContent className="p-4 md:p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('payroll.total_paid')}</p>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-blue-500" />
          <CardContent className="p-4 md:p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('payroll.status')}</p>
            <p className="text-xl md:text-2xl font-bold">{records.length}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-indigo-500" />
          <CardContent className="p-4 md:p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('payroll.paid')}</p>
            <p className="text-xl md:text-2xl font-bold">{paidCount}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-amber-500" />
          <CardContent className="p-4 md:p-5 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">{t('payroll.waiting')}</p>
            <p className="text-xl md:text-2xl font-bold">{draftCount}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyMessage={t('payroll.no_records')}
        getRowId={(row) => row._id}
      />
    </div>
  );
}
