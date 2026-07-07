import api from './client';
import type { EmployeeQueryParams, CreateEmployeeRequest } from '@/types';

export const employeesApi = {
  getAll: (params?: EmployeeQueryParams) => api.get('/employees', { params }).then(r => r.data),
  getMe: () => api.get('/employees/me').then(r => r.data),
  getOne: (id: string) => api.get(`/employees/${id}`).then(r => r.data),
  create: (data: CreateEmployeeRequest) => api.post('/employees', data).then(r => r.data),
  update: (id: string, data: CreateEmployeeRequest) => api.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  bulkDelete: (ids: string[]) => api.post('/employees/bulk-delete', { ids }).then(r => r.data),
  exportCsv: () => api.get('/employees/export', { responseType: 'blob' }).then(r => {
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }),
};
