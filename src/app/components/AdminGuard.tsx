import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/auth-context';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protects admin routes: redirects to login if not authenticated,
 * or to home if authenticated but not admin.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground tracking-wide">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
