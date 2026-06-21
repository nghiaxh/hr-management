import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const processPayrollSchema = z.object({
  employeeIds: z.array(z.string().regex(mongoIdRegex, 'Invalid MongoDB ID')),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  bonuses: z.record(z.string(), z.number()).optional(),
  deductions: z.record(z.string(), z.number()).optional(),
});

export type ProcessPayrollInput = z.infer<typeof processPayrollSchema>;
