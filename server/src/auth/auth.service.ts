import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({ email: dto.email, passwordHash, role: dto.role });
    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email, isActive: true });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.generateToken(user);
  }

  async getMe(userId: string) {
    return this.userModel.findById(userId).select('-passwordHash');
  }

  private generateToken(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      user: { id: user._id, email: user.email, role: user.role },
    };
  }
}
