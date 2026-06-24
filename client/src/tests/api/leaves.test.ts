import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { leavesApi } from '@/api/leaves';

describe('leavesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches leaves with params', async () => {
    const mockResponse = {
      data: {
        data: [{ _id: 'l1', type: 'annual', status: 'pending' }],
        meta: { page: 1, limit: 20, total: 1 },
      },
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await leavesApi.getAll({ status: 'pending' });
    expect(api.get).toHaveBeenCalledWith('/leaves', { params: { status: 'pending' } });
    expect(result.data[0].status).toBe('pending');
  });

  it('getOne fetches single leave', async () => {
    const mockResponse = { data: { _id: 'l1', type: 'annual', status: 'pending' } };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await leavesApi.getOne('l1');
    expect(api.get).toHaveBeenCalledWith('/leaves/l1');
    expect(result.type).toBe('annual');
  });

  it('create posts leave data and returns with pending status', async () => {
    const payload = { type: 'sick', startDate: '2025-07-01', endDate: '2025-07-02', reason: 'Flu' };
    const mockResponse = { data: { _id: 'l2', ...payload, status: 'pending' } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await leavesApi.create(payload);
    expect(api.post).toHaveBeenCalledWith('/leaves', payload);
    expect(result.status).toBe('pending');
  });

  it('updateStatus patches leave with new status', async () => {
    const payload = { status: 'approved' };
    const mockResponse = { data: { _id: 'l1', ...payload } };
    (api.patch as any).mockResolvedValue(mockResponse);
    const result = await leavesApi.updateStatus('l1', payload);
    expect(api.patch).toHaveBeenCalledWith('/leaves/l1/status', payload);
    expect(result.status).toBe('approved');
  });
});
