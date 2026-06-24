import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { payrollApi } from '@/api/payroll';

describe('payrollApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches payroll records', async () => {
    const mockResponse = {
      data: {
        data: [{ _id: 'p1', month: 6, year: 2025, status: 'paid', netPay: 46000 }],
        meta: { page: 1, limit: 20, total: 1 },
      },
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await payrollApi.getAll({ month: 6, year: 2025 });
    expect(api.get).toHaveBeenCalledWith('/payroll', { params: { month: 6, year: 2025 } });
    expect(result.data[0].status).toBe('paid');
  });

  it('process posts employee ids and month/year', async () => {
    const payload = { employeeIds: ['1', '2', '3'], month: 6, year: 2025 };
    const mockResponse = { data: { processed: 3 } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await payrollApi.process(payload);
    expect(api.post).toHaveBeenCalledWith('/payroll/process', payload);
    expect(result.processed).toBe(3);
  });

  it('pay patches payroll record as paid', async () => {
    const mockResponse = { data: { _id: 'p1', status: 'paid', paidAt: '2025-06-30T00:00:00Z' } };
    (api.patch as any).mockResolvedValue(mockResponse);
    const result = await payrollApi.pay('p1');
    expect(api.patch).toHaveBeenCalledWith('/payroll/p1/pay');
    expect(result.status).toBe('paid');
  });
});
