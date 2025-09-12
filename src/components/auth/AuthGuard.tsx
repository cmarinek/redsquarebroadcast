import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingFallback } from '@/components/LoadingFallback';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: 'admin' | 'moderator' | 'user';
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth',
  requiredRole 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        if (requireAuth) {
          navigate(redirectTo);
          return;
        }
      }

      // If auth is required but no session exists
      if (requireAuth && !session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive"
        });
        navigate(redirectTo);
        return;
      }

      // If specific role is required, check user roles
      if (requiredRole && session) {
        const { data: userRoles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (roleError) {
          console.error('Role check error:', roleError);
          toast({
            title: "Authorization Error",
            description: "Unable to verify permissions.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        const hasRequiredRole = userRoles?.some(ur => ur.role === requiredRole);
        if (!hasRequiredRole) {
          toast({
            title: "Access Denied",
            description: `This page requires ${requiredRole} privileges.`,
            variant: "destructive"
          });
          navigate('/');
          return;
        }
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Auth guard error:', error);
      if (requireAuth) {
        navigate(redirectTo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (requireAuth && !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}