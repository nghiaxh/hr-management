import api from './client';

export const employeesApi = {
  getAll: (params?: any) => api.get('/employees', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/employees/${id}`).then(r => r.data),
  create: (data: any) => api.post('/employees', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};
