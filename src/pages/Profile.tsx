import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, CreditCard, Settings, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImageUrl } from "@/utils/media";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useUserRoles } from "@/hooks/useUserRoles";

interface ProfileData {
  id: string;
  display_name: string;
  has_completed_advertiser_onboarding: boolean;
  has_completed_screen_owner_onboarding: boolean;
  has_completed_broadcaster_onboarding: boolean;
  created_at: string;
  updated_at: string;
  avatar_url: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: ''
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image.', variant: 'destructive' });
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast({ title: 'Not signed in', description: 'Please log in.', variant: 'destructive' });
        return;
      }
      const ext = file.name.split('.').pop();
      const path = `${authUser.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('user_id', authUser.id);
      if (updateErr) throw updateErr;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
      toast({ title: 'Avatar updated', description: 'Your profile picture has been updated.' });
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        const profileData: ProfileData = {
          id: data.user_id,
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          has_completed_advertiser_onboarding: data.has_completed_advertiser_onboarding,
          has_completed_screen_owner_onboarding: data.has_completed_screen_owner_onboarding,
          has_completed_broadcaster_onboarding: data.has_completed_broadcaster_onboarding,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setProfile(profileData);
        setFormData({
          display_name: profileData.display_name || ''
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      fetchProfile(); // Refresh the profile data
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img 
                        src={optimizeImageUrl(profile?.avatar_url, { w: 80, h: 80, q: 70 })}
                        alt="User profile avatar"
                        className="w-20 h-20 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 p-2 h-auto"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-medium">Profile Picture</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to personalize your account
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                View your account status and membership information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Roles</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {roles && roles.length > 0 ? (
                      roles.map((r) => (
                        <Badge key={r} variant="outline" className="capitalize">{r}</Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">No roles yet</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm mt-1">
                    {profile?.created_at ? format(new Date(profile.created_at), 'MMMM dd, yyyy') : 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm mt-1">
                    {profile?.updated_at ? format(new Date(profile.updated_at), 'MMMM dd, yyyy') : 'Never'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="bg-green-500/10 text-green-700">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add extra security to your account
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="outline" disabled className="text-red-600">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default Profile;