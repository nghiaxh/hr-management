import api from './client';
import type { PayrollQueryParams, ProcessPayrollRequest } from '@/types';

export const payrollApi = {
  getAll: (params?: PayrollQueryParams) => api.get('/payroll', { params }).then(r => r.data),
  process: (data: ProcessPayrollRequest) => api.post('/payroll/process', data).then(r => r.data),
  pay: (id: string) => api.patch(`/payroll/${id}/pay`).then(r => r.data),
};
