import { describe, it, expect } from 'vitest';
import { leavesApi } from './leaves';

describe('leavesApi', () => {
  it('getAll returns paginated leaves', async () => {
    const result = await leavesApi.getAll();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('getAll filters by status', async () => {
    const result = await leavesApi.getAll({ status: 'pending' });
    expect(result.data.every((l: { status: string }) => l.status === 'pending')).toBe(true);
  });

  it('getOne returns a leave by id', async () => {
    const result = await leavesApi.getOne('leave-1');
    expect(result).toHaveProperty('id');
    expect(result.id).toBe('leave-1');
  });

  it('create sends leave data', async () => {
    const result = await leavesApi.create({
      type: 'annual',
      startDate: '2025-07-01',
      endDate: '2025-07-03',
    });
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('pending');
  });

  it('updateStatus sends status update', async () => {
    const result = await leavesApi.updateStatus('leave-1', { status: 'approved' });
    expect(result.status).toBe('approved');
  });
});
