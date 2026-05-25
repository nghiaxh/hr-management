import api from './client';

export const departmentsApi = {
  getAll: (params?: any) => api.get('/departments', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/departments/${id}`).then(r => r.data),
  create: (data: any) => api.post('/departments', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/departments/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/departments/${id}`),
  getOrgChart: () => api.get('/departments/org-chart').then(r => r.data),
};
