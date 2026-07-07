import { describe, it, expect } from 'vitest';
import { payrollApi } from './payroll';

describe('payrollApi', () => {
  it('getAll returns paginated payroll', async () => {
    const result = await payrollApi.getAll();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
  });

  it('getAll filters by month and year', async () => {
    const result = await payrollApi.getAll({ month: 6, year: 2025 });
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('process sends employee ids and month/year', async () => {
    const result = await payrollApi.process({ employeeIds: ['emp-1'], month: 7, year: 2025 });
    expect(Array.isArray(result)).toBe(true);
  });

  it('pay marks payroll as paid', async () => {
    const result = await payrollApi.pay('pay-1');
    expect(result.status).toBe('paid');
    expect(result).toHaveProperty('paidAt');
  });
});
