import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi } from '../../api/leaves';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { StatusBadge } from '../../components/shared/status-badge';
import { Plus } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function MyLeavesPage() {
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
      <PageHeader title="My Leaves" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Request Leave</Button>} />
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Type</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead></TableRow>
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
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No leaves</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Type</Label>
              <select name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
            <div><Label>End Date</Label><Input name="endDate" type="date" required /></div>
            <div><Label>Reason</Label><Input name="reason" /></div>
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
