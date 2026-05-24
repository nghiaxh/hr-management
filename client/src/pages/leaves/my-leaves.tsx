import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { StatusBadge } from '../../components/shared/status-badge';
import { useTranslation } from '../../context/language-context';
import { Plus } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function MyLeavesPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['leaves'], queryFn: () => leavesApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (d: any) => leavesApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setOpen(false); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({ type: form.get('type'), startDate: form.get('startDate'), endDate: form.get('endDate'), reason: form.get('reason') });
  };

  return (
    <div>
      <PageHeader title={t('leaves.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('leaves.request')}</Button>} />
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
