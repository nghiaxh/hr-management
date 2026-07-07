import { describe, it, expect } from 'vitest';
import { attendanceApi } from './attendance';

describe('attendanceApi', () => {
  it('getAll returns attendance records', async () => {
    const result = await attendanceApi.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getAll with query params', async () => {
    const result = await attendanceApi.getAll({ from: '2025-06-01', to: '2025-06-30' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('checkIn creates a check-in record', async () => {
    const result = await attendanceApi.checkIn();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('checkIn');
    expect(result.status).toBe('present');
  });

  it('checkOut updates a check-in record', async () => {
    const result = await attendanceApi.checkOut('att-1');
    expect(result).toHaveProperty('checkOut');
  });
});
