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
import { Pencil, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await authApi.updateProfile({ name, email });
      setName(updated.name || '');
      toast({ title: t('profile.updated') });
      setProfileOpen(false);
    } catch {
      toast({ title: t('profile.failed_update'), variant: 'destructive' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t('profile.passwords_mismatch'), variant: 'destructive' });
      return;
    }
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast({ title: t('profile.password_changed') });
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: t('profile.password_failed'), variant: 'destructive' });
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

      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('profile.security')}</h2>
            <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />{t('profile.change_password')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('user.edit_profile')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('profile.edit_sr')}</DialogDescription>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>{t('user.name')}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>{t('user.email')}</Label><Input value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label>{t('user.role')}</Label><Input value={user?.role || ''} disabled /></div>
            <Button type="submit" className="w-full">{t('user.save')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('profile.change_password')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('profile.password_sr')}</DialogDescription>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div><Label>{t('profile.current_password')}</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
            <div><Label>{t('profile.new_password')}</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} /></div>
            <div><Label>{t('profile.confirm_password')}</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} /></div>
            <Button type="submit" className="w-full">{t('profile.change_password')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
