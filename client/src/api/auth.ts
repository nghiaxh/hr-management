import api from './client';

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  updateProfile: (data: { name?: string; email?: string }) => api.put('/auth/profile', data).then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
};