import { z } from 'zod';

const baseEmployeeFields = (t: (key: string) => string) => ({
  firstName: z.string().min(1, t('validation.first_name_required')),
  lastName: z.string().min(1, t('validation.last_name_required')),
  position: z.string().min(1, t('validation.position_required')),
  salary: z.coerce.number().min(0, t('validation.salary_positive')),
  departmentId: z.string().min(1, t('validation.department_required')),
  hireDate: z.string().min(1, t('validation.hire_date_required')),
  phone: z.string().optional(),
  contractType: z.string().optional(),
  contractExpiry: z.string().optional(),
});

export const employeeSchema = (t: (key: string) => string) =>
  z.object({
    ...baseEmployeeFields(t),
    userId: z.string().min(1, t('validation.user_id_required')),
  });

export const employeeEditSchema = (t: (key: string) => string) =>
  z.object(baseEmployeeFields(t));

export type EmployeeFormValues = z.infer<ReturnType<typeof employeeSchema>>;
export type EmployeeEditFormValues = z.infer<ReturnType<typeof employeeEditSchema>>;