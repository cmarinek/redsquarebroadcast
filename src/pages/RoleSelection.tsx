import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Monitor, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"broadcaster" | "screen_owner" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user already has a role
    const checkExistingRole = async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (roles && roles.length > 0) {
        // User already has a role, redirect to home
        navigate("/");
      }
    };

    checkExistingRole();
  }, [user, navigate]);

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: selectedRole });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Account setup complete!",
          description: `Welcome to Red Square as a ${selectedRole === 'screen_owner' ? 'Screen Owner' : 'Broadcaster'}!`,
        });
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Account Type</h1>
            <p className="text-muted-foreground">
              Select how you'd like to use the Red Square platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === 'broadcaster' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole('broadcaster')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Broadcaster</CardTitle>
                <CardDescription>
                  Upload and schedule content to display on screens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Upload images, videos, and GIFs</li>
                  <li>• Book time slots on available screens</li>
                  <li>• Target specific audiences and locations</li>
                  <li>• Track campaign performance</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === 'screen_owner' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole('screen_owner')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Screen Owner</CardTitle>
                <CardDescription>
                  Rent out your screen space and earn revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Register your digital screens</li>
                  <li>• Set pricing and availability</li>
                  <li>• Approve or reject content</li>
                  <li>• Earn money from bookings</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button 
              onClick={handleRoleSelection}
              disabled={!selectedRole || loading}
              size="lg"
              className="min-w-48"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Started as {selectedRole === 'broadcaster' ? 'Broadcaster' : selectedRole === 'screen_owner' ? 'Screen Owner' : '...'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;