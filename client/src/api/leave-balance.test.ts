import { describe, it, expect } from 'vitest';
import { leaveBalanceApi } from './leave-balance';

describe('leaveBalanceApi', () => {
  it('getByEmployee returns leave balance', async () => {
    const result = await leaveBalanceApi.getByEmployee('emp-1');
    expect(result).toHaveProperty('annualTotal');
    expect(result).toHaveProperty('annualUsed');
    expect(result).toHaveProperty('sickTotal');
    expect(result).toHaveProperty('personalTotal');
  });
});
