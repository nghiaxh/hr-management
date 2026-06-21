import { LeaveBalance } from '../models/leave-balance.model.js';

export class LeaveBalanceService {
  async findByEmployee(employeeId: string) {
    const balance = await LeaveBalance.findOne({ employeeId: employeeId as any });
    if (!balance) {
      return LeaveBalance.create({ employeeId: employeeId as any });
    }
    return balance;
  }

  async findByUser(employeeIds: string[]) {
    return LeaveBalance.find({ employeeId: { $in: employeeIds as any } });
  }

  async deduct(employeeId: string, type: string, days: number) {
    const balance = await LeaveBalance.findOne({ employeeId: employeeId as any });
    if (!balance) throw new Error('Leave balance not found');

    const typeMap: Record<string, string> = {
      annual: 'annual',
      sick: 'sick',
      personal: 'personal',
    };
    const field = typeMap[type];
    if (!field) throw new Error('Invalid leave type');

    const usedField = `${field}Used` as keyof typeof balance;
    const totalField = `${field}Total` as keyof typeof balance;
    const currentUsed = (balance as any)[usedField] || 0;
    const total = (balance as any)[totalField] || 0;

    if (currentUsed + days > total) {
      throw new Error(`Insufficient ${type} leave balance`);
    }

    (balance as any)[usedField] = currentUsed + days;
    return balance.save();
  }
}
