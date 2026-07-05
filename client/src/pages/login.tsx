import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/auth-context';
import { useTranslation } from '../context/language-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md mx-4"
      >
      <Card>
        <CardHeader className="text-center pb-4">
          <p className="text-sm text-muted-foreground mt-1">{t('login.sign_in_to_account')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg" role="alert">
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer" tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('login.signing_in')}</> : t('login.sign_in')}
            </Button>
          </form>
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('login.demo_accounts')}</p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => { setEmail(account.email); setPassword(account.password); }}
                  className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted hover:bg-accent transition-colors capitalize cursor-pointer"
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
