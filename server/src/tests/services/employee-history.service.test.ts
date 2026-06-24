import { describe, it, expect } from 'vitest';
import { EmployeeHistoryService } from '../../services/employee-history.service.js';
import { createUser, createDepartment, createEmployee, createEmployeeHistory } from '../helpers/factories.js';
import { EmployeeHistory } from '../../models/employee-history.model.js';

const historyService = new EmployeeHistoryService();

describe('EmployeeHistoryService', () => {
  describe('findByEmployee', () => {
    it('should return history sorted by effectiveDate desc', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      await createEmployeeHistory(emp._id, { effectiveDate: new Date('2025-01-01'), newValue: 'Junior' });
      await createEmployeeHistory(emp._id, { effectiveDate: new Date('2025-06-01'), newValue: 'Senior' });

      const records = await historyService.findByEmployee(emp._id.toString());
      expect(records).toHaveLength(2);
      expect(records[0].newValue).toBe('Senior');
      expect(records[1].newValue).toBe('Junior');
    });

    it('should return empty array for employee with no history', async () => {
      const records = await historyService.findByEmployee('000000000000000000000000');
      expect(records).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a history entry', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const entry = await historyService.create(emp._id.toString(), {
        type: 'promotion',
        previousValue: 'Junior',
        newValue: 'Senior',
        effectiveDate: new Date('2025-06-01'),
        note: 'Promoted',
      });

      expect(entry.type).toBe('promotion');
      expect(entry.newValue).toBe('Senior');
      expect(entry.previousValue).toBe('Junior');
    });

    it('should store correct employeeId', async () => {
      const user = await createUser();
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const entry = await historyService.create(emp._id.toString(), {
        type: 'raise',
        newValue: '50000',
        effectiveDate: new Date('2025-01-01'),
      });

      expect(entry.employeeId.toString()).toBe(emp._id.toString());
    });
  });
});
