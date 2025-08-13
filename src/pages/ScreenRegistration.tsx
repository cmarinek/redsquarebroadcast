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
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { useFormValidation } from "@/hooks/useFormValidation";
import { screenRegistrationSchema } from "@/utils/validation";

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

  const { validateForm, getFieldError, markFieldAsTouched, hasErrors } = useFormValidation(screenRegistrationSchema);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    markFieldAsTouched(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.success) {
      toast({
        title: "Please fix validation errors",
        description: "Check the form for errors and try again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Generate unique ID and QR destination URL
      const screenId = crypto.randomUUID();

      const { error } = await supabase
        .from('screens')
        .insert({
          id: screenId,
          owner_user_id: user.id,
          screen_name: formData.screen_name || null,
          location: [formData.address, formData.city].filter(Boolean).join(', '),
          latitude: formData.location_lat ? parseFloat(formData.location_lat) : null,
          longitude: formData.location_lng ? parseFloat(formData.location_lng) : null,
          pricing_cents: parseInt(formData.price_per_hour || '0', 10) * 100,
          availability_start: formData.availability_start,
          availability_end: formData.availability_end,
          currency: 'USD',
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Screen registered successfully!",
        description: "Your screen is now available for booking.",
      });

      navigate(`/screen/${screenId}`);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      const errorMessage = error?.message || 'Registration failed';
      const isConstraintError = errorMessage.includes('unique') || errorMessage.includes('duplicate');
      
      toast({
        title: "Registration failed",
        description: isConstraintError 
          ? "A screen with this information already exists. Please try different details."
          : `Error: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Please enter coordinates manually.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        setFormData(prev => ({
          ...prev,
          location_lat: lat,
          location_lng: lng,
        }));
        
        markFieldAsTouched('location_lat');
        markFieldAsTouched('location_lng');
        
        toast({
          title: "Location detected",
          description: "GPS coordinates have been automatically filled.",
        });
      },
      (error) => {
        let errorMessage = "Please enter coordinates manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location access failed",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <LoadingOverlay isLoading={loading} loadingText="Registering your screen...">
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
                    <Label htmlFor="screen_name">Screen Name *</Label>
                    <Input
                      id="screen_name"
                      placeholder="e.g., Downtown Coffee Shop Display"
                      value={formData.screen_name}
                      onChange={(e) => handleInputChange('screen_name', e.target.value)}
                      className={getFieldError('screen_name') ? 'border-destructive' : ''}
                    />
                    {getFieldError('screen_name') && (
                      <p className="text-sm text-destructive">{getFieldError('screen_name')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={getFieldError('address') ? 'border-destructive' : ''}
                      />
                      {getFieldError('address') && (
                        <p className="text-sm text-destructive">{getFieldError('address')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={getFieldError('city') ? 'border-destructive' : ''}
                      />
                      {getFieldError('city') && (
                        <p className="text-sm text-destructive">{getFieldError('city')}</p>
                      )}
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
                      disabled={loading}
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
                        onChange={(e) => handleInputChange('location_lat', e.target.value)}
                        className={getFieldError('location_lat') ? 'border-destructive' : ''}
                      />
                      {getFieldError('location_lat') && (
                        <p className="text-sm text-destructive">{getFieldError('location_lat')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_lng">Longitude</Label>
                      <Input
                        id="location_lng"
                        placeholder="-74.0060"
                        type="number"
                        step="any"
                        value={formData.location_lng}
                        onChange={(e) => handleInputChange('location_lng', e.target.value)}
                        className={getFieldError('location_lng') ? 'border-destructive' : ''}
                      />
                      {getFieldError('location_lng') && (
                        <p className="text-sm text-destructive">{getFieldError('location_lng')}</p>
                      )}
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
                    <Label htmlFor="price_per_hour">Price per Hour (USD) *</Label>
                    <Input
                      id="price_per_hour"
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="25"
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                      className={getFieldError('price_per_hour') ? 'border-destructive' : ''}
                    />
                    {getFieldError('price_per_hour') && (
                      <p className="text-sm text-destructive">{getFieldError('price_per_hour')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Red Square takes a 10% platform fee
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="availability_start">Available From *</Label>
                      <Input
                        id="availability_start"
                        type="time"
                        value={formData.availability_start}
                        onChange={(e) => handleInputChange('availability_start', e.target.value)}
                        className={getFieldError('availability_start') ? 'border-destructive' : ''}
                      />
                      {getFieldError('availability_start') && (
                        <p className="text-sm text-destructive">{getFieldError('availability_start')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability_end">Available Until *</Label>
                      <Input
                        id="availability_end"
                        type="time"
                        value={formData.availability_end}
                        onChange={(e) => handleInputChange('availability_end', e.target.value)}
                        className={getFieldError('availability_end') ? 'border-destructive' : ''}
                      />
                      {getFieldError('availability_end') && (
                        <p className="text-sm text-destructive">{getFieldError('availability_end')}</p>
                      )}
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
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || hasErrors}
                  className="flex-1"
                >
                  {loading ? "Registering..." : "Register Screen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default ScreenRegistration;