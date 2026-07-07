import api from './client';
import type { DepartmentQueryParams, CreateDepartmentRequest } from '@/types';

export const departmentsApi = {
  getAll: (params?: DepartmentQueryParams) => api.get('/departments', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/departments/${id}`).then(r => r.data),
  create: (data: CreateDepartmentRequest) => api.post('/departments', data).then(r => r.data),
  update: (id: string, data: CreateDepartmentRequest) => api.put(`/departments/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};
