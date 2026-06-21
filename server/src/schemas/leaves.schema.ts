import { z } from 'zod';

export const createLeaveSchema = z.object({
  type: z.enum(['sick', 'annual', 'personal']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().optional(),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;
