import api from './client';

export const employeeHistoryApi = {
  getAll: (employeeId: string) => api.get(`/employees/${employeeId}/history`).then(r => r.data),
  create: (employeeId: string, data: any) => api.post(`/employees/${employeeId}/history`, data).then(r => r.data),
};
