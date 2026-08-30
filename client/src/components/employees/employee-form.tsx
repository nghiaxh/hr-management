import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormValues } from '../../lib/schemas';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTranslation } from '../../context/language-context';
import type { Department } from '../../types';
import type { CreateEmployeeRequest } from '../../types';
import type { UseMutationResult } from '@tanstack/react-query';

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  mutation: UseMutationResult<unknown, Error, CreateEmployeeRequest, unknown>;
}

export function EmployeeForm({ open, onOpenChange, departments, mutation }: EmployeeFormProps) {
  const { t } = useTranslation();
  const schema = employeeSchema(t);
  const form = useForm<EmployeeFormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('employees.add')}</DialogTitle></DialogHeader>
        <DialogDescription className="sr-only">{t('employees.create_record_sr')}</DialogDescription>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('employees.first_name')} error={form.formState.errors.firstName?.message}>
              <Input {...form.register('firstName')} />
            </Field>
            <Field label={t('employees.last_name')} error={form.formState.errors.lastName?.message}>
              <Input {...form.register('lastName')} />
            </Field>
            <Field label={t('employees.position')} error={form.formState.errors.position?.message}>
              <Input {...form.register('position')} />
            </Field>
            <Field label={t('employees.salary')} error={form.formState.errors.salary?.message}>
              <Input type="number" {...form.register('salary')} />
            </Field>
            <Field label={t('employees.department')} error={form.formState.errors.departmentId?.message}>
              <Select {...form.register('departmentId')}>
                <option value="">{t('employees.select')}</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label={t('employees.hire_date')} error={form.formState.errors.hireDate?.message}>
              <Input type="date" {...form.register('hireDate')} />
            </Field>
            <Field label={t('employees.phone')} error={form.formState.errors.phone?.message}>
              <Input {...form.register('phone')} />
            </Field>
            <Field label={t('employees.contract_type_label')} error={form.formState.errors.contractType?.message}>
              <Select {...form.register('contractType')}>
                <option value="">{t('employees.none')}</option>
                <option value="permanent">{t('employees.contract_permanent')}</option>
                <option value="contract">{t('employees.contract_contract')}</option>
                <option value="intern">{t('employees.contract_intern')}</option>
              </Select>
            </Field>
            <Field label={t('employees.contract_expiry_label')} error={form.formState.errors.contractExpiry?.message}>
              <Input type="date" {...form.register('contractExpiry')} />
            </Field>
            <Field label={t('employees.user_id')} error={form.formState.errors.userId?.message}>
              <Input {...form.register('userId')} placeholder={t('employees.user_id_placeholder')} />
            </Field>
          </div>
          <Button type="submit" className="w-full mt-4" isPending={mutation.isPending}>
            {mutation.isPending ? t('employees.creating') : t('employees.create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
