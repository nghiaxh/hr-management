import { describe, it, expect } from 'vitest';
import { PayrollService } from '../../services/payroll.service.js';
import { createUser, createDepartment, createEmployee, createPayroll } from '../helpers/factories.js';

const payrollService = new PayrollService();

describe('PayrollService', () => {
  describe('process', () => {
    it('should create payroll records for employees', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id, { salary: 50000 });

      const results = await payrollService.process({
        employeeIds: [emp._id.toString()],
        month: 6,
        year: 2025,
      });

      expect(results).toHaveLength(1);
      expect(results[0].basicSalary).toBe(50000);
      expect(results[0].netPay).toBe(50000);
      expect(results[0].month).toBe(6);
      expect(results[0].year).toBe(2025);
    });

    it('should skip existing payroll records', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id, { salary: 50000 });
      await createPayroll(emp._id, 6, 2025);

      const results = await payrollService.process({
        employeeIds: [emp._id.toString()],
        month: 6,
        year: 2025,
      });

      expect(results).toHaveLength(0);
    });

    it('should include bonuses and deductions', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id, { salary: 50000 });

      const results = await payrollService.process({
        employeeIds: [emp._id.toString()],
        month: 6,
        year: 2025,
        bonuses: { [emp._id.toString()]: 5000 },
        deductions: { [emp._id.toString()]: 3000 },
      });

      expect(results[0].bonus).toBe(5000);
      expect(results[0].deductions).toBe(3000);
      expect(results[0].netPay).toBe(52000);
    });

    it('should ensure netPay is not negative', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id, { salary: 1000 });

      const results = await payrollService.process({
        employeeIds: [emp._id.toString()],
        month: 6,
        year: 2025,
        deductions: { [emp._id.toString()]: 5000 },
      });

      expect(results[0].netPay).toBe(0);
    });
  });

  describe('pay', () => {
    it('should mark payroll as paid', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      const payroll = await createPayroll(emp._id, 6, 2025);

      const result = await payrollService.pay(payroll._id.toString());
      expect(result.status).toBe('paid');
      expect(result.paidAt).toBeDefined();
    });

    it('should throw for non-existent payroll', async () => {
      await expect(payrollService.pay('000000000000000000000000')).rejects.toThrow('Payroll not found');
    });
  });

  describe('findAll', () => {
    it('should return payroll records for admin', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);
      await createPayroll(emp._id, 6, 2025);

      const result = await payrollService.findAll({}, { id: user._id.toString(), role: 'admin' });
      expect(result.meta.total).toBe(1);
    });

    it('should scope to own records for employee', async () => {
      const user1 = await createUser({ email: 'e1@test.com', role: 'employee' });
      const user2 = await createUser({ email: 'e2@test.com', role: 'employee' });
      const dept = await createDepartment();
      const emp1 = await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);
      await createPayroll(emp1._id, 6, 2025);
      await createPayroll(emp2._id, 6, 2025);

      const result = await payrollService.findAll({}, { id: user1._id.toString(), role: 'employee' });
      expect(result.meta.total).toBe(1);
    });
  });
});
