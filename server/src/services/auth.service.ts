import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { config } from '../config.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

export class AuthService {
  async register(dto: RegisterInput) {
    const existing = await User.findOne({ email: dto.email });
    if (existing) throw new Error('Email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await User.create({ email: dto.email, passwordHash, role: 'employee' });
    return this.generateToken(user);
  }

  async login(dto: LoginInput) {
    const user = await User.findOne({ email: dto.email, isActive: true });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    return this.generateToken(user);
  }

  async getMe(userId: string) {
    return User.findById(userId).select('-passwordHash');
  }

  async updateProfile(userId: string, dto: { name?: string; email?: string }) {
    const update: any = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email;
    return User.findByIdAndUpdate(userId, update, { new: true }).select('-passwordHash');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
  }

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      token: jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn }),
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
    };
  }
}
