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
import { formatDate, formatCurrency } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { ArrowLeft, Briefcase, FileText, History, Plus } from 'lucide-react';

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
      toast({ title: 'History entry added' });
    },
  });

  if (isLoading) return <div className="text-center py-8">{t('common.loading')}</div>;
  if (!emp) return <div className="text-center py-8">Employee not found</div>;

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

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/employees')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />{t('employees.title')}</Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{emp.firstName} {emp.lastName}</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('employees.position')}</dt><dd>{emp.position}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('employees.department')}</dt><dd>{emp.departmentId?.name || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('employees.salary')}</dt><dd>{formatCurrency(emp.salary)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('employees.hire_date')}</dt><dd>{formatDate(emp.hireDate)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('employees.phone')}</dt><dd>{emp.phone || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('user.email')}</dt><dd>{emp.userId?.email || 'N/A'}</dd></div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Contract</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-muted-foreground">Contract Type</dt><dd className="capitalize">{emp.contractType || 'N/A'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Contract Expiry</dt><dd>{emp.contractExpiry ? formatDate(emp.contractExpiry) : 'N/A'}</dd></div>
            </dl>
            {emp.documents && emp.documents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><FileText className="h-3 w-3" />Documents</p>
                <ul className="space-y-1">
                  {emp.documents.map((doc: any, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      {doc.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" />Employee History</CardTitle>
            <Button size="sm" onClick={() => setHistoryOpen(true)}><Plus className="h-3 w-3 mr-1" />Add Entry</Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history entries</p>
          ) : (
            <div className="space-y-0">
              {history.map((entry: any) => (
                <div key={entry._id} className="flex gap-3 pb-4 border-l-2 border-primary/20 pl-4 ml-2 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5 -ml-5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">{entry.type}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(entry.effectiveDate)}</span>
                    </div>
                    <p className="text-sm mt-1">
                      {entry.previousValue && <span className="text-muted-foreground line-through mr-1">{entry.previousValue}</span>}
                      <span className="font-medium">{entry.newValue}</span>
                    </p>
                    {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add History Entry</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Add a history entry for this employee</DialogDescription>
          <form onSubmit={handleHistorySubmit} className="space-y-4">
            <div><Label>Type</Label>
              <select name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="raise">Raise</option>
                <option value="promotion">Promotion</option>
                <option value="transfer">Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><Label>Previous Value</Label><Input name="previousValue" placeholder="e.g. $3,000 / Junior" /></div>
            <div><Label>New Value</Label><Input name="newValue" required placeholder="e.g. $4,000 / Senior" /></div>
            <div><Label>Effective Date</Label><Input name="effectiveDate" type="date" required /></div>
            <div><Label>Note</Label><Input name="note" placeholder="Optional note" /></div>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
