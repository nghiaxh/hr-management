import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { authApi } from '../api/auth';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await authApi.updateProfile({ name, email });
      setName(updated.name || '');
      toast({ title: t('profile.updated') });
      setProfileOpen(false);
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <div className="flex flex-col items-center mb-8">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mb-4">
          {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{user?.name || user?.email}</h1>
        <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('user.info')}</h2>
            <Button variant="outline" size="sm" onClick={() => { setName(user?.name || ''); setEmail(user?.email || ''); setProfileOpen(true); }}>
              <Pencil className="h-4 w-4 mr-2" />{t('user.edit_profile')}
            </Button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t('user.name')}</span>
              <span className="font-medium">{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">{t('user.email')}</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('user.role')}</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('user.edit_profile')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">Edit user profile</DialogDescription>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>{t('user.name')}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>{t('user.email')}</Label><Input value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label>{t('user.role')}</Label><Input value={user?.role || ''} disabled /></div>
            <Button type="submit" className="w-full">{t('user.save')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
