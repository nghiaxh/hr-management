import api from './client';

export const leaveBalanceApi = {
  getMy: () => api.get('/leave-balance/my').then(r => r.data),
};