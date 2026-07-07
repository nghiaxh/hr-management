import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useTranslation } from '../../context/language-context';
import { formatDate, formatCurrency } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import {
  ArrowLeft, Briefcase, FileText, Mail, Phone,
  CalendarDays, BadgeDollarSign, Building2,
  UserRound, Pencil
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const { t } = useTranslation();
  const editSchema = z.object({
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

  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: '', lastName: '', position: '', salary: 0,
      departmentId: '', hireDate: '', phone: '', contractType: '', contractExpiry: '',
    },
  });

  const { data: emp, isLoading, isError: empError } = useQuery({ queryKey: ['employee', id], queryFn: () => employeesApi.getOne(id!) });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  useEffect(() => {
    if (emp) {
      editForm.reset({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        position: emp.position || '',
        salary: emp.salary || 0,
        departmentId: emp.departmentId?.id || emp.departmentId || '',
        hireDate: emp.hireDate?.split('T')[0] || '',
        phone: emp.phone || '',
        contractType: emp.contractType || '',
        contractExpiry: emp.contractExpiry?.split('T')[0] || '',
      });
    }
  }, [emp]);

  const editMutation = useMutation({
    mutationFn: (d: any) => employeesApi.update(id!, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      setEditOpen(false);
      toast({ title: t('employees.updated') });
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('employees.update_failed'), variant: 'destructive' });
    },
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;
  if (empError || !emp) return <div className="text-center py-8 text-destructive">{empError ? t('employees.load_failed') : t('employees.not_found')}</div>;

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        {t('employees.title')}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
          {emp.firstName?.[0]}{emp.lastName?.[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{emp.firstName} {emp.lastName}</h1>
          <p className="text-sm text-muted-foreground">{emp.position}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          {t('employees.edit')}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              {t('employees.name')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <InfoRow icon={Building2} label={t('employees.department')} value={emp.departmentId?.name || t('performance_reviews.na')} />
            <InfoRow icon={BadgeDollarSign} label={t('employees.salary')} value={formatCurrency(emp.salary)} />
            <InfoRow icon={CalendarDays} label={t('employees.hire_date')} value={formatDate(emp.hireDate)} />
            <InfoRow icon={Phone} label={t('employees.phone')} value={emp.phone || t('performance_reviews.na')} />
            <InfoRow icon={Mail} label={t('user.email')} value={emp.userId?.email || t('performance_reviews.na')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              {t('employees.contract')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <InfoRow icon={FileText} label={t('employees.contract_type')} value={t(`employees.contract_${emp.contractType}`) || emp.contractType || t('performance_reviews.na')} />
            <InfoRow icon={CalendarDays} label={t('employees.contract_expiry')} value={emp.contractExpiry ? formatDate(emp.contractExpiry) : t('performance_reviews.na')} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.edit_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.edit_sr')}</DialogDescription>
          <form onSubmit={editForm.handleSubmit((data) => editMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('employees.first_name')}</Label>
                <Input {...editForm.register('firstName')} />
                {editForm.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.firstName.message}</p>}
              </div>
              <div>
                <Label>{t('employees.last_name')}</Label>
                <Input {...editForm.register('lastName')} />
                {editForm.formState.errors.lastName && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.lastName.message}</p>}
              </div>
              <div>
                <Label>{t('employees.position')}</Label>
                <Input {...editForm.register('position')} />
                {editForm.formState.errors.position && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.position.message}</p>}
              </div>
              <div>
                <Label>{t('employees.salary')}</Label>
                <Input type="number" {...editForm.register('salary')} />
                {editForm.formState.errors.salary && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.salary.message}</p>}
              </div>
              <div>
                <Label>{t('employees.department')}</Label>
                <select {...editForm.register('departmentId')} className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  {departments?.data?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {editForm.formState.errors.departmentId && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.departmentId.message}</p>}
              </div>
              <div>
                <Label>{t('employees.hire_date')}</Label>
                <Input type="date" {...editForm.register('hireDate')} />
                {editForm.formState.errors.hireDate && <p className="text-xs text-destructive mt-1">{editForm.formState.errors.hireDate.message}</p>}
              </div>
              <div>
                <Label>{t('employees.phone')}</Label>
                <Input {...editForm.register('phone')} />
              </div>
              <div>
                <Label>{t('employees.contract_type_label')}</Label>
                <select {...editForm.register('contractType')} className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="">{t('employees.none')}</option>
                  <option value="permanent">{t('employees.contract_permanent')}</option>
                  <option value="contract">{t('employees.contract_contract')}</option>
                  <option value="intern">{t('employees.contract_intern')}</option>
                </select>
              </div>
              <div>
                <Label>{t('employees.contract_expiry_label')}</Label>
                <Input type="date" {...editForm.register('contractExpiry')} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={editMutation.isPending}>
              {editMutation.isPending ? t('employees.saving') : t('employees.save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
