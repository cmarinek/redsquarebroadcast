import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function FirstAdminSetup() {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const createFirstAdmin = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create an admin user");
        return;
      }

      // Insert admin role for current user
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: user.id, role: 'admin' }]);

      if (error) {
        console.error("Error creating admin:", error);
        toast.error("Failed to create admin user", {
          description: error.message
        });
        return;
      }

      setComplete(true);
      toast.success("Admin role assigned!", {
        description: "You are now an admin. Please refresh the page."
      });

      // Refresh the page after 2 seconds
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Admin User Created</AlertTitle>
        <AlertDescription>
          Refreshing page to apply admin permissions...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle>First Admin Setup Required</CardTitle>
        </div>
        <CardDescription>
          No admin users exist in the system. Click below to assign yourself the admin role.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createFirstAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Admin User...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Assign Me as First Admin
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
