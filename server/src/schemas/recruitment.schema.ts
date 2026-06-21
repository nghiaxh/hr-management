import { z } from 'zod';

export const createJobPostingSchema = z.object({
  title: z.string(),
  departmentId: z.string(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(['open', 'closed', 'draft']).optional(),
  openings: z.number().min(1).optional(),
});

export const updateJobPostingSchema = createJobPostingSchema.partial();

export const createCandidateSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  jobPostingId: z.string(),
  status: z
    .enum(['applied', 'screening', 'interview', 'offered', 'hired', 'rejected'])
    .optional(),
  resumeUrl: z.string().optional(),
  notes: z.string().optional(),
  appliedDate: z.coerce.date().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>;
export type UpdateJobPostingInput = z.infer<typeof updateJobPostingSchema>;
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
