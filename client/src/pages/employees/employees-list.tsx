import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { StatusBadge } from '../../components/shared/status-badge';
import { Plus, Search } from 'lucide-react';

export default function EmployeesListPage() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['employees', search], queryFn: () => employeesApi.getAll({ search }) });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => departmentsApi.getAll() });

  const createMutation = useMutation({
    mutationFn: (formData: any) => employeesApi.create(formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setOpen(false); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate(Object.fromEntries(form));
  };

  return (
    <div>
      <PageHeader title="Employees" action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Employee</Button>} />
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow> :
              data?.data?.map((emp: any) => (
                <TableRow key={emp._id}>
                  <TableCell><Link to={`/employees/${emp._id}`} className="text-primary hover:underline">{emp.firstName} {emp.lastName}</Link></TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{emp.departmentId?.name || 'N/A'}</TableCell>
                  <TableCell>${emp.salary?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No employees found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>First Name</Label><Input name="firstName" required /></div>
            <div><Label>Last Name</Label><Input name="lastName" required /></div>
            <div><Label>Position</Label><Input name="position" required /></div>
            <div><Label>Salary</Label><Input name="salary" type="number" required /></div>
            <div><Label>Department</Label>
              <select name="departmentId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {departments?.data?.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>Hire Date</Label><Input name="hireDate" type="date" required /></div>
            <div><Label>Phone</Label><Input name="phone" /></div>
            <div><Label>User ID</Label><Input name="userId" required placeholder="User ID from registration" /></div>
            <Button type="submit" className="w-full">Create</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
