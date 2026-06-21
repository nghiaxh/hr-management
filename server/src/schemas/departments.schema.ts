import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const createDepartmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  managerId: z.string().regex(mongoIdRegex, 'Invalid MongoDB ID').optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
