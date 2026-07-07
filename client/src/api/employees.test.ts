import { describe, it, expect } from 'vitest';
import { employeesApi } from './employees';

describe('employeesApi', () => {
  it('getAll returns paginated employees', async () => {
    const result = await employeesApi.getAll();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
  });

  it('getAll filters by search and department', async () => {
    const result = await employeesApi.getAll({ search: 'John', departmentId: 'dept-1' });
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('getMe returns current employee profile', async () => {
    const result = await employeesApi.getMe();
    expect(result).toHaveProperty('firstName');
  });

  it('getOne returns an employee by id', async () => {
    const result = await employeesApi.getOne('emp-1');
    expect(result.id).toBe('emp-1');
  });

  it('create sends employee data', async () => {
    const result = await employeesApi.create({
      userId: 'user-1',
      departmentId: 'dept-1',
      firstName: 'Jane',
      lastName: 'Doe',
      position: 'Designer',
      salary: 12000000,
      hireDate: '2025-01-01',
    });
    expect(result.firstName).toBe('Jane');
  });

  it('update sends updated employee data', async () => {
    const result = await employeesApi.update('emp-1', {
      userId: 'user-1',
      departmentId: 'dept-1',
      firstName: 'Johnny',
      lastName: 'Doe',
      position: 'Senior Developer',
      salary: 20000000,
      hireDate: '2024-01-01',
    });
    expect(result.firstName).toBe('Johnny');
  });

  it('delete sends delete request', async () => {
    const result = await employeesApi.delete('emp-1');
    expect(result.status).toBe(204);
  });

  it('bulkDelete sends list of ids', async () => {
    const result = await employeesApi.bulkDelete(['emp-1', 'emp-2']);
    expect(result.deleted).toBe(2);
  });
});
