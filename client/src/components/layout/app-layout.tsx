import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { Sidebar } from './sidebar';

export function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 animate-pulse shadow-lg" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <Sidebar />
      <main className="flex-1 p-3 md:p-8 pt-14 md:pt-8 min-w-0 animate-fade-in">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
