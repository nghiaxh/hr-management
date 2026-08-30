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
  { name: 'Admin', email: 'admin@hr.com', password: 'admin123' },
  { name: 'Minh Tuấn', email: 'eng.manager@hr.com', password: 'manager123' },
  { name: 'Trần Anh', email: 'emp01@hr.com', password: 'employee123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string, role?: string) => {
    setError('');
    if (role) setLoadingRole(role);
    else setLoading(true);
    try {
      await login(email, password);
      navigate('/leaves');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('login.invalid_credentials');
      setError(message);
    } finally {
      setLoading(false);
      setLoadingRole(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  const busy = loading || loadingRole !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary relative">
      <div className="w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-4">
            <p className="text-sm text-muted">{t('login.sign_in_to_account')}</p>
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
              <Button type="submit" className="w-full" disabled={busy}>
                {loading ? <><CircleNotch className="h-4 w-4 mr-2 animate-spin" />{t('login.signing_in')}</> : t('login.sign_in')}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-separator overflow-hidden">
              <p className="px-3 py-2 text-xs font-medium text-muted border-b border-separator bg-surface-secondary">
                {t('login.demo_accounts')}
              </p>
              <div className="divide-y divide-separator">
                {DEMO_ACCOUNTS.map((account, index) => {
                  const active = loadingRole === String(index);
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => signIn(account.email, account.password, String(index))}
                      disabled={busy}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-surface-secondary disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block text-sm font-medium text-foreground truncate">{account.name}</span>
                          {active && <CircleNotch className="h-3.5 w-3.5 animate-spin text-accent shrink-0" />}
                        </span>
                        <span className="block text-xs text-muted truncate">{account.email}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}