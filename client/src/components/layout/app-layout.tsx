import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { Sidebar } from './sidebar';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 animate-pulse shadow-lg" />
          <p className="text-sm text-muted-foreground animate-pulse">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 p-3 md:p-8 pt-14 md:pt-8 min-w-0"
      >
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
