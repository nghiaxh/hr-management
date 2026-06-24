import { describe, it, expect } from 'vitest';
import { DepartmentsService } from '../../services/departments.service.js';
import { createUser, createDepartment } from '../helpers/factories.js';
import { Department } from '../../models/department.model.js';

const departmentsService = new DepartmentsService();

describe('DepartmentsService', () => {
  describe('findAll', () => {
    it('should return all departments for admin', async () => {
      await createDepartment({ name: 'Engineering' });
      await createDepartment({ name: 'Marketing' });

      const result = await departmentsService.findAll({}, { id: '', role: 'admin' });
      expect(result.meta.total).toBe(2);
    });

    it('should filter by search', async () => {
      await createDepartment({ name: 'Engineering' });
      await createDepartment({ name: 'Marketing' });

      const result = await departmentsService.findAll({ search: 'Eng' });
      expect(result.meta.total).toBe(1);
      expect(result.data[0].name).toBe('Engineering');
    });

    it('should filter by managerId for manager role', async () => {
      const managerUser = await createUser({ role: 'manager' });
      const dept = await createDepartment({ name: 'Managed Dept' });
      dept.managerId = managerUser._id;
      await dept.save();
      await createDepartment({ name: 'Other Dept' });

      const result = await departmentsService.findAll({}, { id: managerUser._id.toString(), role: 'manager' });
      expect(result.meta.total).toBe(1);
      expect(result.data[0].name).toBe('Managed Dept');
    });
  });

  describe('findOne', () => {
    it('should return department by id', async () => {
      const dept = await createDepartment();
      const result = await departmentsService.findOne(dept._id.toString());
      expect(result._id.toString()).toBe(dept._id.toString());
    });

    it('should throw for non-existent department', async () => {
      await expect(departmentsService.findOne('000000000000000000000000')).rejects.toThrow('Department not found');
    });
  });

  describe('create', () => {
    it('should create a department', async () => {
      const dept = await departmentsService.create({ name: 'New Dept', description: 'A new department' });
      expect(dept.name).toBe('New Dept');
      expect(dept.description).toBe('A new department');
    });

    it('should reject duplicate name', async () => {
      await createDepartment({ name: 'Unique' });
      await expect(departmentsService.create({ name: 'Unique' })).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update department', async () => {
      const dept = await createDepartment();
      const updated = await departmentsService.update(dept._id.toString(), { name: 'Updated Dept' });
      expect(updated.name).toBe('Updated Dept');
    });

    it('should throw for non-existent department', async () => {
      await expect(departmentsService.update('000000000000000000000000', { name: 'Nope' })).rejects.toThrow('Department not found');
    });
  });

  describe('remove', () => {
    it('should delete department', async () => {
      const dept = await createDepartment();
      await departmentsService.remove(dept._id.toString());
      const found = await Department.findById(dept._id);
      expect(found).toBeNull();
    });

    it('should throw for non-existent department', async () => {
      await expect(departmentsService.remove('000000000000000000000000')).rejects.toThrow('Department not found');
    });
  });
});
