import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { departmentsApi } from '@/api/departments';

describe('departmentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches all departments', async () => {
    const mockResponse = {
      data: {
        data: [
          { _id: 'd1', name: 'Engineering' },
          { _id: 'd2', name: 'Marketing' },
        ],
        meta: { page: 1, limit: 20, total: 2 },
      },
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await departmentsApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/departments', { params: undefined });
    expect(result.data).toHaveLength(2);
  });

  it('getAll passes params', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [], meta: {} } });
    await departmentsApi.getAll({ page: 2 });
    expect(api.get).toHaveBeenCalledWith('/departments', { params: { page: 2 } });
  });

  it('getOne fetches single department', async () => {
    const mockResponse = { data: { _id: 'd1', name: 'Engineering', description: 'Tech dept' } };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await departmentsApi.getOne('d1');
    expect(api.get).toHaveBeenCalledWith('/departments/d1');
    expect(result.name).toBe('Engineering');
  });

  it('create posts department data', async () => {
    const payload = { name: 'HR', description: 'Human Resources' };
    const mockResponse = { data: { _id: 'd3', ...payload } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await departmentsApi.create(payload);
    expect(api.post).toHaveBeenCalledWith('/departments', payload);
    expect(result._id).toBe('d3');
  });

  it('update puts department data', async () => {
    const payload = { name: 'Engineering Updated' };
    const mockResponse = { data: { _id: 'd1', ...payload } };
    (api.put as any).mockResolvedValue(mockResponse);
    const result = await departmentsApi.update('d1', payload);
    expect(api.put).toHaveBeenCalledWith('/departments/d1', payload);
    expect(result.name).toBe('Engineering Updated');
  });

  it('delete removes department', async () => {
    (api.delete as any).mockResolvedValue({});
    await departmentsApi.delete('d1');
    expect(api.delete).toHaveBeenCalledWith('/departments/d1');
  });
});
