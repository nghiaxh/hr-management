import api from './client';

export const leaveBalanceApi = {
  getByEmployee: (employeeId: string) => api.get(`/leave-balance/${employeeId}`).then(r => r.data),
};
