import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { AttendanceService } from '../../services/attendance.service.js';
import { createUser, createDepartment, createEmployee, createAttendance } from '../helpers/factories.js';
import { Attendance } from '../../models/attendance.model.js';

const attendanceService = new AttendanceService();

describe('AttendanceService', () => {
  describe('checkIn', () => {
    it('should create attendance record with present status before 9AM', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const now = new Date();
      now.setHours(8, 0, 0, 0);
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const record = await attendanceService.checkIn(user._id.toString());
      expect(record.status).toBe('present');
      expect(record.checkIn).toBeDefined();

      vi.useRealTimers();
    });

    it('should create attendance record with late status after 9AM', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      await createEmployee(user._id, dept._id);

      const now = new Date();
      now.setHours(10, 0, 0, 0);
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const record = await attendanceService.checkIn(user._id.toString());
      expect(record.status).toBe('late');

      vi.useRealTimers();
    });

    it('should reject duplicate check-in for same day', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      vi.useFakeTimers();
      vi.setSystemTime(new Date(today.getTime() + 8 * 60 * 60 * 1000));

      await attendanceService.checkIn(user._id.toString());
      await expect(attendanceService.checkIn(user._id.toString())).rejects.toThrow('Already checked in today');

      vi.useRealTimers();
    });

    it('should throw if employee profile not found', async () => {
      const user = await createUser({ role: 'employee' });
      await expect(attendanceService.checkIn(user._id.toString())).rejects.toThrow('Employee profile not found');
    });
  });

  describe('checkOut', () => {
    it('should update check-out time', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const checkInTime = new Date();
      checkInTime.setHours(8, 0, 0, 0);
      const attendance = await createAttendance(emp._id, new Date(), { checkIn: checkInTime });

      const checkOutTime = new Date();
      checkOutTime.setHours(17, 0, 0, 0);
      vi.useFakeTimers();
      vi.setSystemTime(checkOutTime);

      const record = await attendanceService.checkOut(attendance._id.toString(), user._id.toString());
      expect(record.checkOut).toBeDefined();
      expect(record.status).toBe('present');

      vi.useRealTimers();
    });

    it('should set half-day status if worked less than 4 hours', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const checkInTime = new Date();
      checkInTime.setHours(8, 0, 0, 0);
      const attendance = await createAttendance(emp._id, new Date(), { checkIn: checkInTime });

      vi.useFakeTimers();
      vi.setSystemTime(new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000));

      const record = await attendanceService.checkOut(attendance._id.toString(), user._id.toString());
      expect(record.status).toBe('half-day');

      vi.useRealTimers();
    });

    it('should reject check-out without prior check-in', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await expect(attendanceService.checkOut('000000000000000000000000', user._id.toString())).rejects.toThrow('Attendance record not found');
    });

    it('should reject double check-out', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const attendance = await createAttendance(emp._id, new Date(), { checkIn: new Date(), checkOut: new Date() });

      await expect(attendanceService.checkOut(attendance._id.toString(), user._id.toString())).rejects.toThrow('Already checked out');
    });
  });

  describe('findAll', () => {
    it('should return attendance records for admin', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createAttendance(emp._id, new Date('2025-06-01'));

      const records = await attendanceService.findAll({}, { id: user._id.toString(), role: 'admin' });
      expect(records).toHaveLength(1);
    });

    it('should scope to own records for employee', async () => {
      const user1 = await createUser({ email: 'emp1@test.com', role: 'employee' });
      const user2 = await createUser({ email: 'emp2@test.com', role: 'employee' });
      const dept = await createDepartment();
      const emp1 = await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);
      await createAttendance(emp1._id, new Date('2025-06-01'));
      await createAttendance(emp2._id, new Date('2025-06-01'));

      const records = await attendanceService.findAll({}, { id: user1._id.toString(), role: 'employee' });
      expect(records).toHaveLength(1);
    });
  });
});
