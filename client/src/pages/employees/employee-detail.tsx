import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { employeeHistoryApi } from '../../api/employee-history';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useTranslation } from '../../context/language-context';
import { cn, formatDate, formatCurrency } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import {
  ArrowLeft, Briefcase, FileText, History, Plus, Mail, Phone,
  CalendarDays, BadgeDollarSign, Building2, TrendingUp, ArrowRight,
  UserRound, ChevronRight
} from 'lucide-react';

const typeConfig: Record<string, { icon: any }> = {
  raise: { icon: TrendingUp },
  promotion: { icon: ArrowRight },
  transfer: { icon: Building2 },
  other: { icon: ChevronRight },
};

export default function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: emp, isLoading } = useQuery({ queryKey: ['employee', id], queryFn: () => employeesApi.getOne(id!) });
  const { data: history = [] } = useQuery({ queryKey: ['employee-history', id], queryFn: () => employeeHistoryApi.getAll(id!), enabled: !!id });

  const historyMutation = useMutation({
    mutationFn: (d: any) => employeeHistoryApi.create(id!, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-history', id] });
      setHistoryOpen(false);
      toast({ title: t('employees.history_added') });
    },
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;
  if (!emp) return <div className="text-center py-8">{t('employees.not_found')}</div>;

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    historyMutation.mutate({
      type: form.get('type'),
      newValue: form.get('newValue'),
      previousValue: form.get('previousValue') || undefined,
      effectiveDate: form.get('effectiveDate'),
      note: form.get('note') || undefined,
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
      <button onClick={() => navigate('/employees')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('employees.title')}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-md">
          {emp.firstName?.[0]}{emp.lastName?.[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold">{emp.firstName} {emp.lastName}</h1>
          <p className="text-sm text-muted-foreground">{emp.position}</p>
        </div>
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
            <InfoRow icon={Building2} label={t('employees.department')} value={emp.departmentId?.name || 'N/A'} />
            <InfoRow icon={BadgeDollarSign} label={t('employees.salary')} value={formatCurrency(emp.salary)} />
            <InfoRow icon={CalendarDays} label={t('employees.hire_date')} value={formatDate(emp.hireDate)} />
            <InfoRow icon={Phone} label={t('employees.phone')} value={emp.phone || 'N/A'} />
            <InfoRow icon={Mail} label={t('user.email')} value={emp.userId?.email || 'N/A'} />
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
            <InfoRow icon={FileText} label={t('employees.contract_type')} value={t(`employees.contract_${emp.contractType}`) || emp.contractType || 'N/A'} />
            <InfoRow icon={CalendarDays} label={t('employees.contract_expiry')} value={emp.contractExpiry ? formatDate(emp.contractExpiry) : 'N/A'} />
            {emp.documents && emp.documents.length > 0 && (
              <div className="pt-3 mt-1 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  {t('employees.documents')}
                </p>
                <div className="space-y-1">
                  {emp.documents.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1 px-2 rounded-md bg-muted/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      {doc.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('employees.history_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('employees.history_add')}</DialogDescription>
          <form onSubmit={handleHistorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('employees.history_type')}</Label>
                <select name="type" required className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="raise">{t('history.raise')}</option>
                  <option value="promotion">{t('history.promotion')}</option>
                  <option value="transfer">{t('history.transfer')}</option>
                  <option value="other">{t('history.other')}</option>
                </select>
              </div>
              <div>
                <Label>{t('employees.history_date')}</Label>
                <Input name="effectiveDate" type="date" required />
              </div>
              <div>
                <Label>{t('employees.history_previous')}</Label>
                <Input name="previousValue" placeholder={t('employees.history_previous_placeholder')} />
              </div>
              <div>
                <Label>{t('employees.history_new')}</Label>
                <Input name="newValue" required placeholder={t('employees.history_new_placeholder')} />
              </div>
            </div>
            <div>
              <Label>{t('employees.history_note')}</Label>
              <Input name="note" placeholder={t('employees.history_note_placeholder')} />
            </div>
            <Button type="submit" className="w-full">{t('employees.history_save')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
