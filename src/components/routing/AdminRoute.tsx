import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';

interface Props { children: ReactNode }

export default function AdminRoute({ children }: Props) {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRoles();

  if (loading) return null; // or a spinner
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;

  return <>{children}</>;
}
