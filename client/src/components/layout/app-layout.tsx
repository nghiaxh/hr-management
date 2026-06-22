import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { Sidebar } from './sidebar';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground animate-pulse">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-3 md:p-8 pt-14 md:pt-8 min-w-0">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
