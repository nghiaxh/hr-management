import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../../api/departments';
import { PageHeader } from '../../components/shared/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '../../context/language-context';
import { toast } from '../../hooks/use-toast';

export default function DepartmentsListPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDept, setDeletingDept] = useState<any>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['departments', search], queryFn: () => departmentsApi.getAll({ search }) });

  const createMutation = useMutation({
    mutationFn: (d: any) => departmentsApi.create(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setOpen(false); toast({ title: t('departments.created') }); },
    onError: () => toast({ title: t('departments.create_failed'), variant: 'destructive' }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setEditOpen(false); setEditingDept(null); toast({ title: t('departments.updated') }); },
    onError: () => toast({ title: t('departments.update_failed'), variant: 'destructive' }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setDeleteOpen(false); setDeletingDept(null); toast({ title: t('departments.deleted') }); },
    onError: () => toast({ title: t('departments.delete_failed'), variant: 'destructive' }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    createMutation.mutate(Object.fromEntries(form));
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    updateMutation.mutate({ id: editingDept._id, data: Object.fromEntries(form) });
  };

  return (
    <div>
      <PageHeader title={t('departments.title')} action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('departments.add')}</Button>} />
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('departments.search')} value={search} onChange={e => setSearch(e.target.value)} className="w-full md:max-w-sm" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow><TableHead>{t('departments.name')}</TableHead><TableHead>{t('departments.description')}</TableHead><TableHead>{t('departments.manager')}</TableHead><TableHead>{t('departments.actions')}</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">{t('departments.loading')}</TableCell></TableRow> :
              data?.data?.map((dept: any) => (
                <TableRow key={dept._id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.description || '-'}</TableCell>
                  <TableCell>{dept.managerId?.email || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingDept(dept); setEditOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeletingDept(dept); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            {(!data?.data || data.data.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t('departments.no_results')}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.add')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('departments.create_sr')}</DialogDescription>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>{t('departments.name')}</Label><Input name="name" required /></div>
            <div><Label>{t('departments.description')}</Label><Input name="description" /></div>
            <Button type="submit" className="w-full">{t('departments.create')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.edit')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('departments.edit_sr')}</DialogDescription>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>{t('departments.name')}</Label><Input name="name" defaultValue={editingDept?.name} required /></div>
            <div><Label>{t('departments.description')}</Label><Input name="description" defaultValue={editingDept?.description} /></div>
            <Button type="submit" className="w-full">{t('departments.save')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('departments.delete')}</DialogTitle></DialogHeader>
          <DialogDescription>{t('departments.delete_confirm')} <strong>{deletingDept?.name}</strong>? {t('departments.delete_warning')}</DialogDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('dialog.cancel')}</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deletingDept._id)}>{t('departments.delete')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
