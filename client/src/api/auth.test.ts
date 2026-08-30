import { describe, it, expect } from 'vitest';
import { authApi } from './auth';

describe('authApi', () => {
  it('login returns user', async () => {
    const result = await authApi.login('admin@example.com', 'password123');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe('admin@example.com');
  });

  it('getMe returns current user', async () => {
    const result = await authApi.getMe();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email');
    expect(result).toHaveProperty('role');
  });

  it('updateProfile sends name and email', async () => {
    const result = await authApi.updateProfile({ name: 'Updated', email: 'u@example.com' });
    expect(result).toHaveProperty('name');
  });

  it('changePassword sends passwords', async () => {
    const result = await authApi.changePassword('old', 'new123');
    expect(result).toHaveProperty('message');
  });
});