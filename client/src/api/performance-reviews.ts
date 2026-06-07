import api from './client';

export const performanceReviewsApi = {
  getAll: (params?: any) => api.get('/performance-reviews', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/performance-reviews/${id}`).then(r => r.data),
  create: (data: any) => api.post('/performance-reviews', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/performance-reviews/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/performance-reviews/${id}`),
};
