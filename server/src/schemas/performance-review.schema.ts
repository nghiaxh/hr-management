import { z } from 'zod';

export const createPerformanceReviewSchema = z.object({
  employeeId: z.string(),
  period: z.string(),
  rating: z.number().min(1).max(5).optional(),
  comments: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'acknowledged']).optional(),
});

export const updatePerformanceReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comments: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'acknowledged']).optional(),
});

export type CreatePerformanceReviewInput = z.infer<
  typeof createPerformanceReviewSchema
>;
export type UpdatePerformanceReviewInput = z.infer<
  typeof updatePerformanceReviewSchema
>;
