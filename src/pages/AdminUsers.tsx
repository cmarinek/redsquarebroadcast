import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserManagement } from '@/components/admin/UserManagement';
import SEO from '@/components/SEO';

export default function AdminUsers() {
  return (
    <AuthGuard requiredRole="admin">
      <SEO
        title="User Management | Red Square Admin"
        description="Manage user accounts, roles, and permissions"
        path="/admin-users"
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts, roles, and permissions across the platform
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <UserManagement />
        </main>
      </div>
    </AuthGuard>
  );
}