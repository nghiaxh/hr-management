import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';

const DEMO_ACCOUNTS = [
  { role: 'admin', email: 'admin@hr.com', password: 'admin123' },
  { role: 'manager', email: 'eng.manager@hr.com', password: 'manager123' },
  { role: 'employee', email: 'emp01@hr.com', password: 'employee123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/leaves');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('login.invalid_credentials');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card>
          <CardHeader className="text-center pb-4">
            <p className="text-sm text-muted mt-1">{t('login.sign_in_to_account')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-danger bg-danger-soft border border-danger/20 p-3 rounded-lg" role="alert">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                  <Button type="button" variant="ghost" size="icon" onPress={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><CircleNotch className="h-4 w-4 mr-2 animate-spin" />{t('login.signing_in')}</> : t('login.sign_in')}
              </Button>
            </form>
            <div className="mt-6 p-3 rounded-lg bg-surface-secondary/60 border border-separator">
              <p className="text-xs font-medium text-muted mb-2">{t('login.demo_accounts')}</p>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.role}
                    variant="ghost"
                    size="sm"
                    onPress={() => { setEmail(account.email); setPassword(account.password); }}
                    className="text-xs font-medium capitalize"
                  >
                    {account.role}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
