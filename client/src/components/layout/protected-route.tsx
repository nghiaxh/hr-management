import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

interface ProtectedRouteProps {
  roles: ('admin' | 'manager' | 'employee')[];
  children: React.ReactNode;
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/leaves" replace />;

  return <>{children}</>;
}
