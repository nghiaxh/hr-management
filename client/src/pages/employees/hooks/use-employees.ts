import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginationState, RowSelectionState } from '@tanstack/react-table';
import { employeesApi } from '../../../api/employees';
import { departmentsApi } from '../../../api/departments';
import { useToast } from '../../../hooks/use-toast';
import { useDebounce } from '../../../hooks/use-debounce';
import { useTranslation } from '../../../context/language-context';
import type { CreateEmployeeRequest, Employee } from '../../../types';

export function useEmployees() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['employees', debouncedSearch, pagination.pageIndex + 1],
    queryFn: () => employeesApi.getAll({ search: debouncedSearch, page: pagination.pageIndex + 1, limit: pagination.pageSize }),
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  const invalidateEmployees = () => queryClient.invalidateQueries({ queryKey: ['employees'] });

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeesApi.create(data),
    onSuccess: () => {
      invalidateEmployees();
      toast({ title: t('employees.created') });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('employees.create_failed'), variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      invalidateEmployees();
      toast({ title: t('employees.deleted') });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('employees.delete_failed'), variant: 'destructive' }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => employeesApi.bulkDelete(ids),
    onSuccess: (_data, ids) => {
      invalidateEmployees();
      setRowSelection({});
      toast({ title: `${ids.length} ${t('employees.bulk_deleted')}` });
    },
    onError: (err: any) => toast({ title: err?.response?.data?.message || t('employees.bulk_delete_failed'), variant: 'destructive' }),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      await employeesApi.exportCsv();
      toast({ title: t('employees.exported') });
    } catch {
      toast({ title: t('employees.export_failed'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / pagination.pageSize) : 0;
  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  return {
    data: data?.data ?? [],
    departments: departments?.data ?? [],
    isLoading,
    isError,
    queryError,
    meta,
    totalPages,
    pagination,
    setPagination,
    search,
    setSearch,
    rowSelection,
    setRowSelection,
    selectedIds,
    exporting,
    handleExport,
    createMutation,
    deleteMutation,
    bulkDeleteMutation,
  };
}
