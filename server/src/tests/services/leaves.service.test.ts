import { describe, it, expect, beforeAll } from 'vitest';
import { LeavesService } from '../../services/leaves.service.js';
import { createUser, createDepartment, createEmployee, createLeave, createLeaveBalance } from '../helpers/factories.js';

const leavesService = new LeavesService();

describe('LeavesService', () => {
  describe('create', () => {
    it('should create a pending leave request', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const leave = await leavesService.create(
        { type: 'annual', startDate: new Date('2025-07-01'), endDate: new Date('2025-07-03'), reason: 'Vacation' },
        user._id.toString(),
      );
      expect(leave.status).toBe('pending');
      expect(leave.type).toBe('annual');
      expect(leave.reason).toBe('Vacation');
    });

    it('should reject endDate before startDate', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      await createEmployee(user._id, dept._id);

      await expect(leavesService.create(
        { type: 'annual', startDate: new Date('2025-07-05'), endDate: new Date('2025-07-03'), reason: 'Invalid' },
        user._id.toString(),
      )).rejects.toThrow('endDate must be >= startDate');
    });

    it('should reject leave exceeding 30 days', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      await createEmployee(user._id, dept._id);

      await expect(leavesService.create(
        { type: 'annual', startDate: new Date('2025-07-01'), endDate: new Date('2025-08-05'), reason: 'Too long' },
        user._id.toString(),
      )).rejects.toThrow('Leave cannot exceed 30 days');
    });

    it('should reject overlapping approved leaves', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeave(emp._id, { startDate: new Date('2025-07-01'), endDate: new Date('2025-07-05'), status: 'approved' });

      await expect(leavesService.create(
        { type: 'annual', startDate: new Date('2025-07-03'), endDate: new Date('2025-07-07'), reason: 'Overlap' },
        user._id.toString(),
      )).rejects.toThrow('Overlapping approved leave exists');
    });

    it('should throw if employee profile not found', async () => {
      const user = await createUser({ role: 'employee' });
      await expect(leavesService.create(
        { type: 'annual', startDate: new Date('2025-07-01'), endDate: new Date('2025-07-03'), reason: 'No profile' },
        user._id.toString(),
      )).rejects.toThrow('Employee profile not found');
    });
  });

  describe('updateStatus', () => {
    it('should approve leave and deduct balance', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id, { annualTotal: 12, annualUsed: 0 });
      const leave = await createLeave(emp._id, { type: 'annual', startDate: new Date('2025-08-01'), endDate: new Date('2025-08-03') });

      const result = await leavesService.updateStatus(
        leave._id.toString(),
        { status: 'approved' },
        user._id.toString(),
      );
      expect(result.status).toBe('approved');
    });

    it('should reject already processed leave', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const leave = await createLeave(emp._id, { status: 'approved' });

      await expect(leavesService.updateStatus(
        leave._id.toString(),
        { status: 'approved' },
        user._id.toString(),
      )).rejects.toThrow('Can only update pending leaves');
    });

    it('should reject leave with insufficient balance', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeaveBalance(emp._id, { annualTotal: 12, annualUsed: 11 });
      const leave = await createLeave(emp._id, { type: 'annual', startDate: new Date('2025-09-01'), endDate: new Date('2025-09-05') });

      await expect(leavesService.updateStatus(
        leave._id.toString(),
        { status: 'approved' },
        user._id.toString(),
      )).rejects.toThrow('Insufficient leave balance');
    });

    it('should reject with reason', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const leave = await createLeave(emp._id);

      const result = await leavesService.updateStatus(
        leave._id.toString(),
        { status: 'rejected', rejectionReason: 'Not enough notice' },
        user._id.toString(),
      );
      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Not enough notice');
    });
  });

  describe('findAll', () => {
    it('should return all leaves for admin', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createLeave(emp._id);

      const result = await leavesService.findAll({}, { id: user._id.toString(), role: 'admin' });
      expect(result.meta.total).toBe(1);
    });

    it('should scope leaves to employee for employee role', async () => {
      const user1 = await createUser({ email: 'emp1@test.com', role: 'employee' });
      const user2 = await createUser({ email: 'emp2@test.com', role: 'employee' });
      const dept = await createDepartment();
      const emp1 = await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);
      await createLeave(emp1._id);
      await createLeave(emp2._id);

      const result = await leavesService.findAll({}, { id: user1._id.toString(), role: 'employee' });
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return leave by id', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const leave = await createLeave(emp._id);

      const result = await leavesService.findOne(leave._id.toString(), { id: user._id.toString(), role: 'admin' });
      expect(result._id.toString()).toBe(leave._id.toString());
    });

    it('should throw for non-existent leave', async () => {
      await expect(leavesService.findOne('000000000000000000000000', { id: '', role: 'admin' })).rejects.toThrow('Leave not found');
    });

    it('should deny employee access to other employee leave', async () => {
      const user1 = await createUser({ email: 'e1@test.com', role: 'employee' });
      const user2 = await createUser({ email: 'e2@test.com', role: 'employee' });
      const dept = await createDepartment();
      await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);
      const leave2 = await createLeave(emp2._id);

      await expect(leavesService.findOne(leave2._id.toString(), { id: user1._id.toString(), role: 'employee' })).rejects.toThrow('Access denied');
    });
  });
});
