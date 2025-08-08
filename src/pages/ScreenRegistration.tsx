import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, MapPin, Clock, DollarSign, Wifi, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";

const ScreenRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    screen_name: "",
    address: "",
    city: "",
    location_lat: "",
    location_lng: "",
    price_per_hour: "",
    availability_start: "09:00",
    availability_end: "21:00",
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique QR code URL
      const screenId = crypto.randomUUID();
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/screen/${screenId}`;

      const { error } = await supabase
        .from('screens')
        .insert({
          id: screenId,
          owner_id: user.id,
          screen_name: formData.screen_name,
          address: formData.address,
          city: formData.city,
          location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
          location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
          price_per_hour: parseInt(formData.price_per_hour) * 100, // Convert to cents
          availability_start: formData.availability_start,
          availability_end: formData.availability_end,
          qr_code_url: qrCodeUrl,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Screen registered successfully!",
        description: "Your screen is now available for booking.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude.toString(),
            location_lng: position.coords.longitude.toString(),
          }));
          toast({
            title: "Location detected",
            description: "GPS coordinates have been automatically filled.",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enter coordinates manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Register Your Screen
            </h1>
            <p className="text-muted-foreground">
              Add your digital screen to the Red Square network and start earning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Screen Details
                </CardTitle>
                <CardDescription>
                  Basic information about your screen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="screen_name">Screen Name</Label>
                  <Input
                    id="screen_name"
                    placeholder="e.g., Downtown Coffee Shop Display"
                    value={formData.screen_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, screen_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <CardDescription>
                  Help users find your screen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Use Current Location
                  </Button>
                  <span className="text-sm text-muted-foreground">or enter manually</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location_lat">Latitude</Label>
                    <Input
                      id="location_lat"
                      placeholder="40.7128"
                      type="number"
                      step="any"
                      value={formData.location_lat}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_lat: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_lng">Longitude</Label>
                    <Input
                      id="location_lng"
                      placeholder="-74.0060"
                      type="number"
                      step="any"
                      value={formData.location_lng}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_lng: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Availability
                </CardTitle>
                <CardDescription>
                  Set your rates and operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_hour">Price per Hour (USD)</Label>
                  <Input
                    id="price_per_hour"
                    type="number"
                    min="1"
                    placeholder="25"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Red Square takes a 10% platform fee
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability_start">Available From</Label>
                    <Input
                      id="availability_start"
                      type="time"
                      value={formData.availability_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability_start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability_end">Available Until</Label>
                    <Input
                      id="availability_end"
                      type="time"
                      value={formData.availability_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability_end: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                After registration, you'll receive a unique QR code that users can scan to find and book your screen.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Registering..." : "Register Screen"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScreenRegistration;