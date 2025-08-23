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
import { useTranslation } from "react-i18next";

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"advertiser" | "screen_owner" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

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
          title: t('roleSelection.setupComplete'),
          description: `${t('roleSelection.welcome')} ${selectedRole === 'screen_owner' ? t('roleSelection.screenOwner') : t('roleSelection.advertiser')}!`,
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
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('roleSelection.title')}</h1>
            <p className="text-muted-foreground">
              {t('roleSelection.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === 'advertiser' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRole('advertiser')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('roleSelection.advertiser')}</CardTitle>
                <CardDescription>
                  {t('roleSelection.advertiserDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t('roleSelection.advertiserFeatures.upload')}</li>
                  <li>• {t('roleSelection.advertiserFeatures.book')}</li>
                  <li>• {t('roleSelection.advertiserFeatures.target')}</li>
                  <li>• {t('roleSelection.advertiserFeatures.track')}</li>
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
                <CardTitle>{t('roleSelection.screenOwner')}</CardTitle>
                <CardDescription>
                  {t('roleSelection.screenOwnerDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t('roleSelection.screenOwnerFeatures.register')}</li>
                  <li>• {t('roleSelection.screenOwnerFeatures.pricing')}</li>
                  <li>• {t('roleSelection.screenOwnerFeatures.approve')}</li>
                  <li>• {t('roleSelection.screenOwnerFeatures.earn')}</li>
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
              {t('roleSelection.getStartedAs')} {selectedRole === 'advertiser' ? t('roleSelection.advertiser') : selectedRole === 'screen_owner' ? t('roleSelection.screenOwner') : '...'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;