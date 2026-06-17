import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveBalance, LeaveBalanceDocument } from './schemas/leave-balance.schema.js';

@Injectable()
export class LeaveBalanceService {
  constructor(
    @InjectModel(LeaveBalance.name) private balanceModel: Model<LeaveBalanceDocument>,
  ) {}

  async findByEmployee(employeeId: string) {
    const balance = await this.balanceModel.findOne({ employeeId: employeeId as any });
    if (!balance) {
      return this.balanceModel.create({ employeeId: employeeId as any });
    }
    return balance;
  }

  async findByUser(employeeIds: string[]) {
    return this.balanceModel.find({ employeeId: { $in: employeeIds as any } });
  }

  async deduct(employeeId: string, type: string, days: number) {
    const balance = await this.balanceModel.findOne({ employeeId: employeeId as any });
    if (!balance) throw new NotFoundException('Leave balance not found');

    const typeMap: Record<string, string> = {
      annual: 'annual',
      sick: 'sick',
      personal: 'personal',
    };
    const field = typeMap[type];
    if (!field) throw new BadRequestException('Invalid leave type');

    const usedField = `${field}Used` as keyof LeaveBalanceDocument;
    const totalField = `${field}Total` as keyof LeaveBalanceDocument;
    const currentUsed = (balance as any)[usedField] || 0;
    const total = (balance as any)[totalField] || 0;

    if (currentUsed + days > total) {
      throw new BadRequestException(`Insufficient ${type} leave balance`);
    }

    (balance as any)[usedField] = currentUsed + days;
    return balance.save();
  }
}
