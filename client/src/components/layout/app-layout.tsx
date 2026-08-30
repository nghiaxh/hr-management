import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from '../../context/language-context';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';
import { useState } from 'react';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent-soft animate-pulse" />
          <p className="text-sm text-muted animate-pulse">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-surface focus:border focus:border-border focus:rounded-lg focus:text-sm focus:font-medium">
        {t('app.skip_to_content') || 'Skip to content'}
      </a>
      <div className="flex min-h-screen bg-background">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopHeader onMenuToggle={() => setMobileOpen(prev => !prev)} />
          <main id="main-content" className="flex-1 p-4 md:p-6 min-w-0 overflow-auto">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
