import api from './client';

export const attendanceApi = {
  getAll: (params?: any) => api.get('/attendance', { params }).then(r => r.data),
  checkIn: () => api.post('/attendance/check-in').then(r => r.data),
  checkOut: (id: string) => api.patch(`/attendance/${id}/check-out`).then(r => r.data),
};
