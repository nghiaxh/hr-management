import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const attendanceQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  employeeId: z.string().regex(mongoIdRegex, 'Invalid MongoDB ID').optional(),
  status: z.string().optional(),
});

export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
