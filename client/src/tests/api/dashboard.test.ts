import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { dashboardApi } from '@/api/dashboard';

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('get fetches dashboard summary data', async () => {
    const mockResponse = {
      data: {
        totalEmployees: 50,
        totalDepartments: 6,
        pendingLeaves: 5,
        presentToday: 42,
        monthlyPayroll: 250000,
        departmentStats: [
          { name: 'Engineering', count: 20 },
          { name: 'Marketing', count: 10 },
        ],
        recentLeaves: [],
      },
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await dashboardApi.get();
    expect(api.get).toHaveBeenCalledWith('/dashboard');
    expect(result.totalEmployees).toBe(50);
    expect(result.pendingLeaves).toBe(5);
    expect(result.presentToday).toBe(42);
    expect(result.departmentStats).toHaveLength(2);
  });
});
