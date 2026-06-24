import { describe, it, expect } from 'vitest';
import { DashboardService } from '../../services/dashboard.service.js';
import { createUser, createDepartment, createEmployee, createLeave, createAttendance, createPayroll } from '../helpers/factories.js';

const dashboardService = new DashboardService();

describe('DashboardService', () => {
  describe('admin dashboard', () => {
    it('should return all system stats', async () => {
      const admin = await createUser({ role: 'admin' });
      const dept = await createDepartment({ name: 'Engineering' });
      const emp = await createEmployee(admin._id, dept._id);

      const dashboard = await dashboardService.getDashboard({ id: admin._id.toString(), role: 'admin' });

      expect(dashboard.totalEmployees).toBe(1);
      expect(dashboard.totalDepartments).toBe(1);
      expect(dashboard.pendingLeaves).toBe(0);
      expect(dashboard.presentToday).toBe(0);
      expect(dashboard.departmentStats).toBeDefined();
      expect(dashboard.recentLeaves).toBeDefined();
    });
  });

  describe('manager dashboard', () => {
    it('should return department-scoped stats', async () => {
      const managerUser = await createUser({ role: 'manager' });
      const dept = await createDepartment({ name: 'Engineering' });
      const managerEmp = await createEmployee(managerUser._id, dept._id);

      const empUser = await createUser({ email: 'emp@test.com', role: 'employee' });
      await createEmployee(empUser._id, dept._id);

      const dashboard = await dashboardService.getDashboard({ id: managerUser._id.toString(), role: 'manager' });

      expect(dashboard.totalEmployees).toBe(2);
      expect(dashboard.departmentName).toBe('Engineering');
      expect(dashboard.pendingLeaves).toBe(0);
    });

    it('should return empty object if no employee profile', async () => {
      const managerUser = await createUser({ role: 'manager' });
      const dashboard = await dashboardService.getDashboard({ id: managerUser._id.toString(), role: 'manager' });
      expect(dashboard).toEqual({});
    });
  });

  describe('employee dashboard', () => {
    it('should return personal stats', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      await createLeave(emp._id, { status: 'pending' });
      await createLeave(emp._id, { status: 'approved' });

      const dashboard = await dashboardService.getDashboard({ id: user._id.toString(), role: 'employee' });

      expect(dashboard.myLeaves).toBeDefined();
      expect(dashboard.myLeaves.pending).toBe(1);
      expect(dashboard.myLeaves.approved).toBe(1);
      expect(dashboard.myAttendance).toBeDefined();
      expect(dashboard.upcomingLeaves).toBeDefined();
    });

    it('should return empty object if no employee profile', async () => {
      const user = await createUser({ role: 'employee' });
      const dashboard = await dashboardService.getDashboard({ id: user._id.toString(), role: 'employee' });
      expect(dashboard).toEqual({});
    });
  });
});
