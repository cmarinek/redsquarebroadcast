import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserManagement } from '@/components/admin/UserManagement';
import { DataExportTools } from '@/components/shared/DataExportTools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Download } from "lucide-react";
import SEO from '@/components/SEO';

export default function AdminUsers() {
  return (
    <AuthGuard requiredRole="admin">
      <SEO
        title="User Management | Red Square Admin"
        description="Manage user accounts, roles, and permissions"
        path="/admin/users"
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts, roles, and permissions across the platform
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="h-4 w-4 mr-2" />
                Role Management
              </TabsTrigger>
              <TabsTrigger value="export">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <UserManagement />
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>
                    Configure roles and permissions for different user types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Admin</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>✓ Full system access</li>
                            <li>✓ User management</li>
                            <li>✓ Financial oversight</li>
                            <li>✓ Content moderation</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Screen Owner</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>✓ Screen management</li>
                            <li>✓ Revenue tracking</li>
                            <li>✓ Content approval</li>
                            <li>✓ Payout requests</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Broadcaster</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>✓ Content upload</li>
                            <li>✓ Booking screens</li>
                            <li>✓ Campaign management</li>
                            <li>✓ Analytics access</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <DataExportTools userRole="admin" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}