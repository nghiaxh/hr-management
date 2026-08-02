import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { attendanceApi } from '../../api/attendance';
import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent } from '../../components/ui/card';
import { DataTable } from '../../components/ui/data-table';
import { DataTableColumnHeader } from '../../components/ui/data-table-column-header';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { formatDate } from '../../lib/utils';
import { Attendance } from '../../types';

const columnHelper = createColumnHelper<Attendance>();

const STATUS_META: Record<string, { color: string; bar: string }> = {
  present: { color: 'text-success', bar: 'bg-success' },
  late: { color: 'text-warning', bar: 'bg-warning' },
  absent: { color: 'text-danger', bar: 'bg-danger' },
  'half-day': { color: 'text-accent', bar: 'bg-accent' },
};

export default function AttendanceReportPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ['attendance'], queryFn: () => attendanceApi.getAll() });

  const records = Array.isArray(data) ? data : data?.data || [];

  const stats: Record<string, number> = records.reduce((acc: any, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const total = records.length;

  const columns = [
    columnHelper.accessor((row) => `${(row.employeeId as any)?.firstName || ''} ${(row.employeeId as any)?.lastName || ''}`.trim() || '-', {
      id: 'employee',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.employee')} />,
    }),
    columnHelper.accessor('date', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.date')} />,
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor('checkIn', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.check_in')} />,
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleTimeString('vi-VN') : '-',
    }),
    columnHelper.accessor('checkOut', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.check_out')} />,
      cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleTimeString('vi-VN') : '-',
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('attendance.status')} className="justify-center" />,
      cell: ({ getValue }) => <div className="text-center"><StatusBadge status={getValue()} /></div>,
    }),
  ];

  if (isError) {
    return <div className="flex flex-col items-center justify-center min-h-64 gap-2 text-center p-8"><p className="text-sm text-danger">{(queryError as any)?.response?.data?.message || t('attendance.load_failed')}</p></div>;
  }

  return (
    <div>
      <PageHeader title={t('attendance.report')} />

      {total > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = stats[key] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <Card key={key} className="overflow-hidden">
                  <div className={`h-1 ${meta.bar}`} />
                  <CardContent>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted mt-0.5 capitalize">{t(`status.${key.replace('-', '_')}`)}</p>
                    <p className="text-xs font-medium mt-1">{pct.toFixed(0)}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="overflow-hidden mb-6">
            <CardContent className="p-5">
              <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-tertiary/60">
                {Object.keys(STATUS_META).map((key) => {
                  const count = stats[key] || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={key}
                      className={STATUS_META[key].bar}
                      style={{ width: `${(count / total) * 100}%` }}
                      title={`${key}: ${count}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5 text-xs text-muted">
                {Object.keys(STATUS_META).map((key) => {
                  const count = stats[key] || 0;
                  if (count === 0) return null;
                  return (
                    <span key={key} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${STATUS_META[key].bar}`} />
                      <span className="capitalize">{t(`status.${key.replace('-', '_')}`)}</span>
                      <span className="font-medium">{((count / total) * 100).toFixed(0)}%</span>
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        error={isError ? (queryError as any)?.response?.data?.message || t('attendance.load_failed') : undefined}
        emptyMessage={t('attendance.no_records')}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
