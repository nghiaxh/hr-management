import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from '@/api/client';
import { authApi } from '@/api/auth';

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login posts credentials and returns token and user', async () => {
    const mockResponse = {
      data: { token: 'abc123', user: { id: '1', email: 'admin@test.com', role: 'admin' } },
    };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await authApi.login('admin@test.com', 'Password1');
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@test.com',
      password: 'Password1',
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('register posts email and password', async () => {
    const mockResponse = {
      data: { token: 'xyz', user: { id: '2', email: 'new@test.com', role: 'employee' } },
    };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await authApi.register('new@test.com', 'Password1');
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@test.com',
      password: 'Password1',
    });
    expect(result.token).toBe('xyz');
  });

  it('getMe fetches current user', async () => {
    const mockResponse = { data: { id: '1', email: 'admin@test.com', role: 'admin' } };
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await authApi.getMe();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result.email).toBe('admin@test.com');
  });

  it('updateProfile updates user profile', async () => {
    const payload = { name: 'New Name', email: 'new@test.com' };
    const mockResponse = { data: { id: '1', ...payload } };
    (api.put as any).mockResolvedValue(mockResponse);
    const result = await authApi.updateProfile(payload);
    expect(api.put).toHaveBeenCalledWith('/auth/profile', payload);
    expect(result.name).toBe('New Name');
  });

  it('changePassword posts current and new password', async () => {
    const mockResponse = { data: { message: 'Password changed successfully' } };
    (api.post as any).mockResolvedValue(mockResponse);
    const result = await authApi.changePassword('oldPass', 'newPass');
    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'oldPass',
      newPassword: 'newPass',
    });
    expect(result.message).toBe('Password changed successfully');
  });
});
