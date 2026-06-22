import { useState, useRef, useEffect } from 'react';
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
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useTranslation } from '../../context/language-context';
import { cn, formatDate, formatCurrency } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { SkeletonTable } from '../../components/shared/skeleton';
import {
  ArrowLeft, Briefcase, FileText, History, Plus, Mail, Phone,
  CalendarDays, BadgeDollarSign, Building2, TrendingUp, ArrowRight,
  UserRound, ChevronRight, Pencil, Upload, Trash2, Download
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

  const historySchema = z.object({
    type: z.enum(['raise', 'promotion', 'transfer', 'other']),
    newValue: z.string().min(1, t('validation.new_value_required')),
    previousValue: z.string().optional(),
    effectiveDate: z.string().min(1, t('validation.date_required')),
    note: z.string().optional(),
  });

const typeConfig: Record<string, { icon: any }> = {
  raise: { icon: TrendingUp },
  promotion: { icon: ArrowRight },
  transfer: { icon: Building2 },
  other: { icon: ChevronRight },
};

  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [removeDocTarget, setRemoveDocTarget] = useState<string | null>(null);

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: '', lastName: '', position: '', salary: 0,
      departmentId: '', hireDate: '', phone: '', contractType: '', contractExpiry: '',
    },
  });

  const historyForm = useForm<z.infer<typeof historySchema>>({
    resolver: zodResolver(historySchema),
    defaultValues: { type: 'raise', newValue: '', previousValue: '', effectiveDate: '', note: '' },
  });

  const { data: emp, isLoading, isError: empError } = useQuery({ queryKey: ['employee', id], queryFn: () => employeesApi.getOne(id!) });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });
  const { data: history = [], isError: historyError } = useQuery({ queryKey: ['employee-history', id], queryFn: () => employeesApi.getHistory(id!), enabled: !!id });

  useEffect(() => {
    if (emp) {
      editForm.reset({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        position: emp.position || '',
        salary: emp.salary || 0,
        departmentId: emp.departmentId?._id || emp.departmentId || '',
        hireDate: emp.hireDate?.split('T')[0] || '',
        phone: emp.phone || '',
        contractType: emp.contractType || '',
        contractExpiry: emp.contractExpiry?.split('T')[0] || '',
      });
    }
  }, [emp]);

  const historyMutation = useMutation({
    mutationFn: (d: any) => employeesApi.addHistory(id!, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-history', id] });
      setHistoryOpen(false);
      toast({ title: t('employees.history_added') });
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('employees.history_failed'), variant: 'destructive' });
    },
  });

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

  const uploadMutation = useMutation({
    mutationFn: (file: File) => employeesApi.uploadDocument(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      toast({ title: t('employees.document_uploaded') });
      setDocOpen(false);
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('employees.upload_failed'), variant: 'destructive' });
    },
  });

  const removeDocMutation = useMutation({
    mutationFn: (docId: string) => employeesApi.removeDocument(id!, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      toast({ title: t('employees.document_removed') });
    },
    onError: (err: any) => {
      toast({ title: err?.response?.data?.message || t('employees.remove_doc_failed'), variant: 'destructive' });
    },
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;
  if (empError || !emp) return <div className="text-center py-8 text-destructive">{empError ? t('employees.load_failed') : t('employees.not_found')}</div>;

  const onHistorySubmit = (data: z.infer<typeof historySchema>) => {
    historyMutation.mutate({
      ...data,
      previousValue: data.previousValue || undefined,
      note: data.note || undefined,
    });
  };

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
            <div className="pt-3 mt-1 border-t border-border/40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  {t('employees.documents')}
                </p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDocOpen(true)}>
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </div>
              {(!emp.documents || emp.documents.length === 0) ? (
                <p className="text-xs text-muted-foreground/60 py-1">{t('employees.no_documents')}</p>
              ) : (
                <div className="space-y-1">
                  {emp.documents.map((doc: any) => (
                    <div key={doc._id} className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 rounded-md bg-muted/50 group">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 truncate hover:text-foreground">
                        <Download className="h-3 w-3 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </a>
                      <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setRemoveDocTarget(doc._id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              {t('employees.history')}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t('employees.history_add')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t('employees.no_history')}</p>
          ) : (
            <div className="space-y-0">
              {history.map((entry: any, idx: number) => {
                const config = typeConfig[entry.type] || typeConfig.other;
                const Icon = config.icon;
                return (
                  <div key={entry._id} className="flex gap-4 pb-5 border-l-2 border-border ml-3 pl-5 last:pb-0 relative">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 -ml-[22px] mt-0.5 ring-2 ring-background bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t(`history.${entry.type}`)}</span>
                        <span className="text-[11px] text-muted-foreground/60">{formatDate(entry.effectiveDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-sm">
                        {entry.previousValue && (
                          <>
                            <span className="text-muted-foreground line-through">{entry.previousValue}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          </>
                        )}
                        <span className="font-medium">{entry.newValue}</span>
                      </div>
                      {entry.note && <p className="text-xs text-muted-foreground/60 mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={(o) => { setHistoryOpen(o); if (!o) historyForm.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.history_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.history_add')}</DialogDescription>
          <form onSubmit={historyForm.handleSubmit(onHistorySubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('employees.history_type')}</Label>
                <select {...historyForm.register('type')} className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="raise">{t('history.raise')}</option>
                  <option value="promotion">{t('history.promotion')}</option>
                  <option value="transfer">{t('history.transfer')}</option>
                  <option value="other">{t('history.other')}</option>
                </select>
              </div>
              <div>
                <Label>{t('employees.history_date')}</Label>
                <Input type="date" {...historyForm.register('effectiveDate')} />
                {historyForm.formState.errors.effectiveDate && <p className="text-xs text-destructive mt-1">{historyForm.formState.errors.effectiveDate.message}</p>}
              </div>
              <div>
                <Label>{t('employees.history_previous')}</Label>
                <Input {...historyForm.register('previousValue')} placeholder={t('employees.history_previous_placeholder')} />
              </div>
              <div>
                <Label>{t('employees.history_new')}</Label>
                <Input {...historyForm.register('newValue')} placeholder={t('employees.history_new_placeholder')} />
                {historyForm.formState.errors.newValue && <p className="text-xs text-destructive mt-1">{historyForm.formState.errors.newValue.message}</p>}
              </div>
            </div>
            <div>
              <Label>{t('employees.history_note')}</Label>
              <Input {...historyForm.register('note')} placeholder={t('employees.history_note_placeholder')} />
            </div>
            <Button type="submit" className="w-full" disabled={historyMutation.isPending}>
              {historyMutation.isPending ? t('employees.saving') : t('employees.history_save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
                  {departments?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
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

      <ConfirmDialog
        open={!!removeDocTarget}
        onOpenChange={(o) => { if (!o) setRemoveDocTarget(null); }}
        title={t('auth.confirm_remove_doc')}
        description={t('auth.confirm_remove_doc_desc')}
        confirmLabel={t('employees.delete')}
        cancelLabel={t('dialog.cancel')}
        variant="destructive"
        onConfirm={() => { if (removeDocTarget) { removeDocMutation.mutate(removeDocTarget); setRemoveDocTarget(null); } }}
      />

      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.upload_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.upload_sr')}</DialogDescription>
          <div className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMutation.mutate(file);
              }}
            />
            {uploadMutation.isPending && <p className="text-sm text-muted-foreground">{t('employees.uploading')}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
