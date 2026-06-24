import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { attendanceApi } from '@/api/attendance';

describe('attendanceApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll fetches attendance records', async () => {
    const mockResponse = {
      data: [
        { _id: 'a1', date: '2025-06-01', status: 'present' },
        { _id: 'a2', date: '2025-06-02', status: 'late' },
      ],
    };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await attendanceApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/attendance', { params: undefined });
    expect(result).toHaveLength(2);
  });

  it('getAll passes params', async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    await attendanceApi.getAll({ month: 6, year: 2025 });
    expect(api.get).toHaveBeenCalledWith('/attendance', { params: { month: 6, year: 2025 } });
  });

  it('checkIn posts and returns attendance record', async () => {
    const mockResponse = { data: { _id: 'a3', status: 'present', checkIn: '2025-06-03T08:00:00Z' } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await attendanceApi.checkIn();
    expect(api.post).toHaveBeenCalledWith('/attendance/check-in');
    expect(result.status).toBe('present');
  });

  it('checkOut patches attendance with checkout time', async () => {
    const mockResponse = { data: { _id: 'a1', checkOut: '2025-06-01T17:00:00Z' } };
    (api.patch as any).mockResolvedValue(mockResponse);
    const result = await attendanceApi.checkOut('a1');
    expect(api.patch).toHaveBeenCalledWith('/attendance/a1/check-out');
    expect(result.checkOut).toBeDefined();
  });
});
