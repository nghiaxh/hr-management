import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { leaveBalanceApi } from '../../api/leave-balance';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { useAuth } from '../../context/auth-context';
import { employeesApi } from '../../api/employees';
import { Plus } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function MyLeavesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['leaves'], queryFn: () => leavesApi.getAll() });

  const { data: employee } = useQuery({
    queryKey: ['my-employee'],
    queryFn: async () => {
      const emp = await employeesApi.getAll();
      return emp.data?.find((e: any) => e.userId?._id === user?.id || e.userId === user?.id);
    },
    enabled: !!user?.id,
  });

  const { data: balance } = useQuery({
    queryKey: ['leave-balance', employee?._id],
    queryFn: () => leaveBalanceApi.getByEmployee(employee!._id),
    enabled: !!employee?._id,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => leavesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setOpen(false); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({ type: form.get('type'), startDate: form.get('startDate'), endDate: form.get('endDate'), reason: form.get('reason') });
  };

  const balanceItems = balance ? [
    { label: 'Annual Leave', used: balance.annualUsed, total: balance.annualTotal },
    { label: 'Sick Leave', used: balance.sickUsed, total: balance.sickTotal },
    { label: 'Personal Leave', used: balance.personalUsed, total: balance.personalTotal },
  ] : [];

  return (
    <div>
      <PageHeader title={t('leaves.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('leaves.request')}</Button>} />

      {balanceItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {balanceItems.map((item) => {
            const remaining = item.total - item.used;
            const pct = item.total > 0 ? (item.used / item.total) * 100 : 0;
            return (
              <Card key={item.label}>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold mt-1">{remaining} <span className="text-sm font-normal text-muted-foreground">/ {item.total} days</span></p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/30 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('leaves.type')}</TableHead><TableHead>{t('leaves.start')}</TableHead><TableHead>{t('leaves.end')}</TableHead><TableHead>{t('leaves.status')}</TableHead><TableHead>{t('leaves.reason')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((leave: any) => (
                <TableRow key={leave._id}>
                  <TableCell className="capitalize">{leave.type}</TableCell>
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell><StatusBadge status={leave.status} /></TableCell>
                  <TableCell>{leave.reason || '-'}</TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t('leaves.no_results')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('leaves.request_title')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Submit a leave request</DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>{t('leaves.type')}</Label>
              <select name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="annual">{t('leaves.annual')}</option>
                <option value="sick">{t('leaves.sick')}</option>
                <option value="personal">{t('leaves.personal')}</option>
              </select>
            </div>
            <div><Label>{t('leaves.start_date')}</Label><Input name="startDate" type="date" required /></div>
            <div><Label>{t('leaves.end_date')}</Label><Input name="endDate" type="date" required /></div>
            <div><Label>{t('leaves.reason')}</Label><Input name="reason" /></div>
            <Button type="submit" className="w-full">{t('leaves.submit')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
