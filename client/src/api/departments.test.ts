import { describe, it, expect } from 'vitest';
import { departmentsApi } from './departments';

describe('departmentsApi', () => {
  it('getAll returns departments', async () => {
    const result = await departmentsApi.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getOne returns a department by id', async () => {
    const result = await departmentsApi.getOne('dept-1');
    expect(result.id).toBe('dept-1');
  });

  it('create sends department data', async () => {
    const result = await departmentsApi.create({ name: 'HR', description: 'Human Resources' });
    expect(result).toHaveProperty('id');
  });

  it('update sends updated department data', async () => {
    const result = await departmentsApi.update('dept-1', { name: 'Engineering Updated' });
    expect(result.name).toBe('Engineering Updated');
  });

  it('delete sends delete request', async () => {
    const result = await departmentsApi.delete('dept-1');
    expect(result.status).toBe(204);
  });
});
