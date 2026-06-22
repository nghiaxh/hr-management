import { z } from 'zod';

export const createLeaveBalanceSchema = z.object({
  employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID'),
  annualTotal: z.number().min(0).default(12),
  annualUsed: z.number().min(0).default(0),
  sickTotal: z.number().min(0).default(30),
  sickUsed: z.number().min(0).default(0),
  personalTotal: z.number().min(0).default(3),
  personalUsed: z.number().min(0).default(0),
});

export const updateLeaveBalanceSchema = createLeaveBalanceSchema.partial();

export type CreateLeaveBalanceInput = z.infer<typeof createLeaveBalanceSchema>;
export type UpdateLeaveBalanceInput = z.infer<typeof updateLeaveBalanceSchema>;
