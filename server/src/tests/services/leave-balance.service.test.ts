import { describe, it, expect } from 'vitest';
import { LeaveBalanceService } from '../../services/leave-balance.service.js';
import { createUser, createDepartment, createEmployee, createLeaveBalance } from '../helpers/factories.js';
import { LeaveBalance } from '../../models/leave-balance.model.js';

const leaveBalanceService = new LeaveBalanceService();

describe('LeaveBalanceService', () => {
  describe('findByEmployee', () => {
    it('should return existing balance', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id);

      const balance = await leaveBalanceService.findByEmployee(emp._id.toString());
      expect(balance.annualTotal).toBe(12);
      expect(balance.sickTotal).toBe(30);
    });

    it('should auto-create balance if not found', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const balance = await leaveBalanceService.findByEmployee(emp._id.toString());
      expect(balance.annualTotal).toBe(12);
      expect(balance.annualUsed).toBe(0);
    });
  });

  describe('findByUser', () => {
    it('should return balances for multiple employees', async () => {
      const user1 = await createUser({ email: 'a1@test.com' });
      const user2 = await createUser({ email: 'a2@test.com' });
      const dept = await createDepartment();
      const emp1 = await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);
      await createLeaveBalance(emp1._id);
      await createLeaveBalance(emp2._id);

      const balances = await leaveBalanceService.findByUser([emp1._id.toString(), emp2._id.toString()]);
      expect(balances).toHaveLength(2);
    });
  });

  describe('deduct', () => {
    it('should deduct days from annual balance', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id, { annualTotal: 12, annualUsed: 2 });

      const balance = await leaveBalanceService.deduct(emp._id.toString(), 'annual', 3);
      expect(balance.annualUsed).toBe(5);
    });

    it('should deduct days from sick balance', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id, { sickTotal: 30, sickUsed: 1 });

      const balance = await leaveBalanceService.deduct(emp._id.toString(), 'sick', 2);
      expect(balance.sickUsed).toBe(3);
    });

    it('should deduct days from personal balance', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id);

      const balance = await leaveBalanceService.deduct(emp._id.toString(), 'personal', 1);
      expect(balance.personalUsed).toBe(1);
    });

    it('should throw when insufficient balance', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id, { annualTotal: 12, annualUsed: 11 });

      await expect(leaveBalanceService.deduct(emp._id.toString(), 'annual', 3)).rejects.toThrow('Insufficient');
    });

    it('should throw for invalid leave type', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id);

      await expect(leaveBalanceService.deduct(emp._id.toString(), 'invalid' as any, 1)).rejects.toThrow('Invalid leave type');
    });

    it('should throw if balance not found', async () => {
      await expect(leaveBalanceService.deduct('000000000000000000000000', 'annual', 1)).rejects.toThrow('Leave balance not found');
    });
  });
});
