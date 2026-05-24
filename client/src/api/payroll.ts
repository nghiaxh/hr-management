import api from './client';

export const payrollApi = {
  getAll: (params?: any) => api.get('/payroll', { params }).then(r => r.data),
  process: (data: any) => api.post('/payroll/process', data).then(r => r.data),
  pay: (id: string) => api.patch(`/payroll/${id}/pay`).then(r => r.data),
};
