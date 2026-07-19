import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { authApi } from '../api/auth';
import { Pencil, Lock, Eye, EyeOff } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleSave = async (data: z.infer<typeof profileSchema>) => {
    setProfileLoading(true);
    try {
      const updated = await authApi.updateProfile(data);
      profileForm.reset({ name: updated.name || '', email: updated.email || '' });
      toast({ title: t('profile.updated') });
      setProfileOpen(false);
    } catch {
      toast({ title: t('profile.failed_update'), variant: 'destructive' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    setPasswordLoading(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword);
      toast({ title: t('profile.password_changed') });
      setPasswordOpen(false);
      passwordForm.reset();
    } catch {
      toast({ title: t('profile.password_failed'), variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <div className="flex flex-col items-center mb-8">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-content text-3xl font-bold mb-4">
          {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold">{user?.name || user?.email}</h1>
        <p className="text-sm text-base-content/60 capitalize">{user?.role}</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('user.info')}</h2>
            <Button variant="outline" size="sm" onClick={() => { profileForm.reset({ name: user?.name || '', email: user?.email || '' }); setProfileOpen(true); }}>
              <Pencil className="h-4 w-4 mr-2" />{t('user.edit_profile')}
            </Button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-base-content/60">{t('user.name')}</span>
              <span className="font-medium">{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-base-content/60">{t('user.email')}</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/60">{t('user.role')}</span>
              <span className="font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('profile.security')}</h2>
            <Button variant="outline" size="sm" onClick={() => { passwordForm.reset(); setPasswordOpen(true); }}>
              <Lock className="h-4 w-4 mr-2" />{t('profile.change_password')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={profileOpen} onOpenChange={(o) => { setProfileOpen(o); if (!o) profileForm.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('user.edit_profile')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('profile.edit_sr')}</DialogDescription>
          <form onSubmit={profileForm.handleSubmit(handleSave)} className="space-y-4">
            <div>
              <Label>{t('user.name')}</Label>
              <Input {...profileForm.register('name')} />
              {profileForm.formState.errors.name && <p className="text-xs text-error mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label>{t('user.email')}</Label>
              <Input {...profileForm.register('email')} />
              {profileForm.formState.errors.email && <p className="text-xs text-error mt-1">{profileForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label>{t('user.role')}</Label>
              <Input value={user?.role || ''} disabled />
            </div>
            <Button type="submit" className="w-full" disabled={profileLoading}>
              {profileLoading ? t('user.saving') : t('user.save')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={(o) => { setPasswordOpen(o); if (!o) passwordForm.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('profile.change_password')}</DialogTitle></DialogHeader>
          <DialogDescription className="sr-only">{t('profile.password_sr')}</DialogDescription>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div>
              <Label>{t('profile.current_password')}</Label>
              <div className="relative">
                <Input type={showCurrent ? 'text' : 'password'} {...passwordForm.register('currentPassword')} />
                <Button type="button" variant="ghost" size="icon" onPress={() => setShowCurrent(!showCurrent)} tabIndex={-1} aria-label={showCurrent ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.currentPassword && <p className="text-xs text-error mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <Label>{t('profile.new_password')}</Label>
              <div className="relative">
                <Input type={showNew ? 'text' : 'password'} {...passwordForm.register('newPassword')} />
                <Button type="button" variant="ghost" size="icon" onPress={() => setShowNew(!showNew)} tabIndex={-1} aria-label={showNew ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.newPassword && <p className="text-xs text-error mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <Label>{t('profile.confirm_password')}</Label>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} {...passwordForm.register('confirmPassword')} />
                <Button type="button" variant="ghost" size="icon" onPress={() => setShowConfirm(!showConfirm)} tabIndex={-1} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-error mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={passwordLoading}>
              {passwordLoading ? t('user.saving') : t('profile.change_password')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
