import api from './client';
import type { LeaveQueryParams, CreateLeaveRequest, UpdateLeaveStatusRequest } from '@/types';

export const leavesApi = {
  getAll: (params?: LeaveQueryParams) => api.get('/leaves', { params }).then(r => r.data),
  create: (data: CreateLeaveRequest) => api.post('/leaves', data).then(r => r.data),
  updateStatus: (id: string, data: UpdateLeaveStatusRequest) => api.patch(`/leaves/${id}/status`, data).then(r => r.data),
};
