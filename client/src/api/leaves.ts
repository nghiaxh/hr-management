import api from './client';

export const leavesApi = {
  getAll: (params?: any) => api.get('/leaves', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/leaves/${id}`).then(r => r.data),
  create: (data: any) => api.post('/leaves', data).then(r => r.data),
  updateStatus: (id: string, data: any) => api.patch(`/leaves/${id}/status`, data).then(r => r.data),
};
