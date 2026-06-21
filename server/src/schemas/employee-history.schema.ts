import { z } from 'zod';

export const createEmployeeHistorySchema = z.object({
  type: z.enum(['raise', 'promotion', 'transfer', 'other']),
  previousValue: z.string().optional(),
  newValue: z.string(),
  effectiveDate: z.coerce.date(),
  note: z.string().optional(),
});

export type CreateEmployeeHistoryInput = z.infer<
  typeof createEmployeeHistorySchema
>;
