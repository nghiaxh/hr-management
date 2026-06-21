import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const createEmployeeSchema = z.object({
  userId: z.string().regex(mongoIdRegex, 'Invalid MongoDB ID'),
  departmentId: z.string().regex(mongoIdRegex, 'Invalid MongoDB ID'),
  firstName: z.string(),
  lastName: z.string(),
  position: z.string(),
  salary: z.number().min(0),
  hireDate: z.coerce.date(),
  phone: z.string().optional(),
  contractType: z.string().optional(),
  contractExpiry: z.coerce.date().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
