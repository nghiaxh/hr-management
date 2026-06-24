import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../../services/auth.service.js';
import { User } from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser } from '../helpers/factories.js';

const authService = new AuthService();

describe('AuthService', () => {
  describe('register', () => {
    it('should create user and return token', async () => {
      const result = await authService.register({
        email: 'newuser@test.com',
        password: 'Password1',
      });
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('newuser@test.com');
      expect(result.user.role).toBe('employee');

      const user = await User.findOne({ email: 'newuser@test.com' });
      expect(user).toBeDefined();
      expect(user!.passwordHash).not.toBe('Password1');
    });

    it('should throw if email already exists', async () => {
      await createUser({ email: 'existing@test.com' });
      await expect(authService.register({
        email: 'existing@test.com',
        password: 'Password1',
      })).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('Password1', 10);
      await User.create({
        email: 'valid@test.com',
        passwordHash,
        role: 'admin',
        name: 'Admin',
        isActive: true,
      });

      const result = await authService.login({ email: 'valid@test.com', password: 'Password1' });
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('valid@test.com');
      expect(result.user.role).toBe('admin');
    });

    it('should throw for wrong password', async () => {
      const passwordHash = await bcrypt.hash('Password1', 10);
      await User.create({ email: 'wrongpw@test.com', passwordHash, role: 'employee', isActive: true });

      await expect(authService.login({ email: 'wrongpw@test.com', password: 'WrongPass1' })).rejects.toThrow('Invalid credentials');
    });

    it('should throw for non-existent email', async () => {
      await expect(authService.login({ email: 'nobody@test.com', password: 'Password1' })).rejects.toThrow('Invalid credentials');
    });

    it('should throw for inactive user', async () => {
      const passwordHash = await bcrypt.hash('Password1', 10);
      await User.create({ email: 'inactive@test.com', passwordHash, role: 'employee', isActive: false });

      await expect(authService.login({ email: 'inactive@test.com', password: 'Password1' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getMe', () => {
    it('should return user without passwordHash', async () => {
      const user = await createUser({ email: 'me@test.com' });
      const result = await authService.getMe(user._id.toString());
      expect(result).toBeDefined();
      expect(result!.email).toBe('me@test.com');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should return null for non-existent user', async () => {
      const result = await authService.getMe('000000000000000000000000');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user name and email', async () => {
      const user = await createUser({ email: 'update@test.com', name: 'Old Name' });
      const result = await authService.updateProfile(user._id.toString(), { name: 'New Name', email: 'newemail@test.com' });
      expect(result!.name).toBe('New Name');
      expect(result!.email).toBe('newemail@test.com');
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      const passwordHash = await bcrypt.hash('CurrentPass1', 10);
      const user = await User.create({ email: 'changepw@test.com', passwordHash, role: 'employee', isActive: true });

      const result = await authService.changePassword(user._id.toString(), 'CurrentPass1', 'NewPass123');
      expect(result.message).toBe('Password changed successfully');

      const updated = await User.findById(user._id);
      const valid = await bcrypt.compare('NewPass123', updated!.passwordHash);
      expect(valid).toBe(true);
    });

    it('should throw when current password is wrong', async () => {
      const passwordHash = await bcrypt.hash('CurrentPass1', 10);
      const user = await User.create({ email: 'wrongpw@test.com', passwordHash, role: 'employee', isActive: true });

      await expect(authService.changePassword(user._id.toString(), 'WrongPass1', 'NewPass123')).rejects.toThrow('Current password is incorrect');
    });
  });
});
