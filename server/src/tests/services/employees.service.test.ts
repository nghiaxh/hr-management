import { describe, it, expect, beforeAll } from 'vitest';
import { EmployeesService } from '../../services/employees.service.js';
import { createUser, createDepartment, createEmployee, createEmployeeHistory } from '../helpers/factories.js';
import { Employee } from '../../models/employee.model.js';
import { User } from '../../models/user.model.js';

const employeesService = new EmployeesService();

describe('EmployeesService', () => {
  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      await createEmployee(user._id, dept._id);

      const result = await employeesService.findAll({ page: 1, limit: 20 }, { id: user._id.toString(), role: 'admin' });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
    });

    it('should filter by search query', async () => {
      const user = await createUser({ role: 'admin' });
      const dept = await createDepartment();
      await createEmployee(user._id, dept._id, { firstName: 'Jane' });

      const result = await employeesService.findAll({ search: 'Jane' }, { id: '', role: 'admin' });
      expect(result.meta.total).toBe(1);
      expect(result.data[0].firstName).toBe('Jane');
    });

    it('should filter by departmentId', async () => {
      const user = await createUser({ role: 'admin' });
      const dept1 = await createDepartment({ name: 'Engineering' });
      const dept2 = await createDepartment({ name: 'Marketing' });
      await createEmployee(user._id, dept1._id);

      const result = await employeesService.findAll({ departmentId: dept1._id.toString() }, { id: '', role: 'admin' });
      expect(result.meta.total).toBe(1);
    });

    it('should scope to manager department', async () => {
      const managerUser = await createUser({ role: 'manager' });
      const otherUser = await createUser({ role: 'employee', email: 'other@test.com' });
      const dept = await createDepartment();
      await createEmployee(managerUser._id, dept._id);
      await createEmployee(otherUser._id, dept._id);

      const result = await employeesService.findAll({}, { id: managerUser._id.toString(), role: 'manager' });
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const result = await employeesService.findOne(emp._id.toString(), { id: user._id.toString(), role: 'admin' });
      expect(result._id.toString()).toBe(emp._id.toString());
    });

    it('should throw for non-existent employee', async () => {
      await expect(employeesService.findOne('000000000000000000000000', { id: '', role: 'admin' })).rejects.toThrow('Employee not found');
    });

    it('should deny access for employee viewing other profile', async () => {
      const user1 = await createUser({ email: 'emp1@test.com', role: 'employee' });
      const user2 = await createUser({ email: 'emp2@test.com', role: 'employee' });
      const dept = await createDepartment();
      await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id, { firstName: 'Other' });

      await expect(employeesService.findOne(emp2._id.toString(), { id: user1._id.toString(), role: 'employee' })).rejects.toThrow('Access denied');
    });
  });

  describe('create', () => {
    it('should create an employee', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await employeesService.create({
        userId: user._id.toString() as any,
        departmentId: dept._id.toString() as any,
        firstName: 'New',
        lastName: 'Hire',
        position: 'Engineer',
        salary: 60000,
        hireDate: new Date('2025-01-01'),
      });

      expect(emp.firstName).toBe('New');
      expect(emp.position).toBe('Engineer');
    });

    it('should allow creating employee without validating ref existence', async () => {
      const user = await createUser({ role: 'employee' });
      const emp = await employeesService.create({
        userId: user._id.toString() as any,
        departmentId: '000000000000000000000000' as any,
        firstName: 'New',
        lastName: 'Hire',
        position: 'Engineer',
        salary: 60000,
        hireDate: new Date('2025-01-01'),
      });
      expect(emp.firstName).toBe('New');
    });
  });

  describe('update', () => {
    it('should update employee fields', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const updated = await employeesService.update(emp._id.toString(), { position: 'Senior Developer', salary: 70000 });
      expect(updated.position).toBe('Senior Developer');
      expect(updated.salary).toBe(70000);
    });

    it('should throw for non-existent employee', async () => {
      await expect(employeesService.update('000000000000000000000000', { position: 'Lead' })).rejects.toThrow('Employee not found');
    });
  });

  describe('remove', () => {
    it('should delete employee', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      await employeesService.remove(emp._id.toString());
      const found = await Employee.findById(emp._id);
      expect(found).toBeNull();
    });

    it('should throw for non-existent employee', async () => {
      await expect(employeesService.remove('000000000000000000000000')).rejects.toThrow('Employee not found');
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple employees', async () => {
      const dept = await createDepartment();
      const user1 = await createUser({ email: 'bulk1@test.com' });
      const user2 = await createUser({ email: 'bulk2@test.com' });
      const emp1 = await createEmployee(user1._id, dept._id);
      const emp2 = await createEmployee(user2._id, dept._id);

      const result = await employeesService.bulkDelete([emp1._id.toString(), emp2._id.toString()]);
      expect(result.deleted).toBe(2);

      const count = await Employee.countDocuments();
      expect(count).toBe(0);
    });

    it('should reject empty or oversized id arrays', async () => {
      await expect(employeesService.bulkDelete([])).rejects.toThrow('Invalid or too many IDs');
      await expect(employeesService.bulkDelete(new Array(101).fill('a'))).rejects.toThrow('Invalid or too many IDs');
    });
  });

  describe('exportCsv', () => {
    it('should return CSV string with headers', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment({ name: 'Engineering' });
      await createEmployee(user._id, dept._id);

      const csv = await employeesService.exportCsv({ id: '', role: 'admin' });
      expect(csv).toContain('firstName,lastName,position,department,salary,email,phone,contractType,hireDate');
      expect(csv).toContain('John');
      expect(csv).toContain('Engineering');
    });
  });

  describe('addDocument / removeDocument', () => {
    it('should add a document to employee', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const file = { originalname: 'resume.pdf', filename: '123-resume.pdf', mimetype: 'application/pdf' } as Express.Multer.File;
      const updated = await employeesService.addDocument(emp._id.toString(), file);
      expect(updated.documents).toHaveLength(1);
      expect(updated.documents[0].name).toBe('resume.pdf');
    });

    it('should remove a document from employee', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const file = { originalname: 'doc.pdf', filename: '123-doc.pdf', mimetype: 'application/pdf' } as Express.Multer.File;
      const withDoc = await employeesService.addDocument(emp._id.toString(), file);
      const docId = (withDoc.documents[0] as any)._id.toString();

      const updated = await employeesService.removeDocument(emp._id.toString(), docId);
      expect(updated.documents).toHaveLength(0);
    });
  });

  describe('findByUserId', () => {
    it('should return employee for user', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const result = await employeesService.findByUserId(user._id.toString());
      expect(result!._id.toString()).toBe(emp._id.toString());
    });
  });

  describe('getHistory / addHistory', () => {
    it('should add and retrieve employee history', async () => {
      const user = await createUser({ role: 'employee' });
      const dept = await createDepartment();
      const emp = await createEmployee(user._id, dept._id);

      const history = await employeesService.addHistory(emp._id.toString(), {
        type: 'raise',
        newValue: '60000',
        effectiveDate: new Date('2025-06-01'),
        note: 'Performance raise',
      });

      const records = await employeesService.getHistory(emp._id.toString());
      expect(records).toHaveLength(1);
      expect(records[0].newValue).toBe('60000');
    });
  });
});
