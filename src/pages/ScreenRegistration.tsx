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
import { useTranslation } from 'react-i18next';

const ScreenRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
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
        title: t('common.error'),
        description: t('errors.validationFailed'),
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
        title: t('pages.screenRegistration.screenRegisteredSuccess'),
        description: t('pages.screenRegistration.screenRegisteredDescription'),
      });

      navigate(`/screen/${screenId}`);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      const errorMessage = error?.message || 'Registration failed';
      const isConstraintError = errorMessage.includes('unique') || errorMessage.includes('duplicate');
      
      toast({
        title: t('pages.screenRegistration.registrationFailed'),
        description: isConstraintError 
          ? t('pages.screenRegistration.duplicateScreenError')
          : `${t('common.error')}: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('pages.screenRegistration.geolocationNotSupported'),
        description: t('pages.screenRegistration.enterCoordinatesManually'),
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
          title: t('pages.screenRegistration.locationDetected'),
          description: t('pages.screenRegistration.locationDetectedDescription'),
        });
      },
      (error) => {
        let errorMessage = t('pages.screenRegistration.enterCoordinatesManually');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('pages.screenRegistration.locationAccessDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('pages.screenRegistration.locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('pages.screenRegistration.locationTimeout');
            break;
        }
        
        toast({
          title: t('pages.screenRegistration.locationAccessFailed'),
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
      
      <LoadingOverlay isLoading={loading} loadingText={t('pages.screenRegistration.registeringScreen')}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('pages.screenRegistration.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages.screenRegistration.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    {t('pages.screenRegistration.screenDetails')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.screenRegistration.screenDetailsDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="screen_name">{t('pages.screenRegistration.screenNameLabel')}</Label>
                    <Input
                      id="screen_name"
                      placeholder={t('pages.screenRegistration.screenNamePlaceholder')}
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
                      <Label htmlFor="address">{t('pages.screenRegistration.addressLabel')}</Label>
                      <Input
                        id="address"
                        placeholder={t('pages.screenRegistration.addressPlaceholder')}
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={getFieldError('address') ? 'border-destructive' : ''}
                      />
                      {getFieldError('address') && (
                        <p className="text-sm text-destructive">{getFieldError('address')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('pages.screenRegistration.cityLabel')}</Label>
                      <Input
                        id="city"
                        placeholder={t('pages.screenRegistration.cityPlaceholder')}
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
                    {t('pages.screenRegistration.locationTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.screenRegistration.locationDescription')}
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
                      {t('pages.screenRegistration.useCurrentLocation')}
                    </Button>
                    <span className="text-sm text-muted-foreground">{t('pages.screenRegistration.orEnterManually')}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location_lat">{t('pages.screenRegistration.latitudeLabel')}</Label>
                      <Input
                        id="location_lat"
                        placeholder={t('pages.screenRegistration.latitudePlaceholder')}
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
                      <Label htmlFor="location_lng">{t('pages.screenRegistration.longitudeLabel')}</Label>
                      <Input
                        id="location_lng"
                        placeholder={t('pages.screenRegistration.longitudePlaceholder')}
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
                    {t('pages.screenRegistration.pricingTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.screenRegistration.pricingDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_per_hour">{t('pages.screenRegistration.pricePerHourLabel')}</Label>
                    <Input
                      id="price_per_hour"
                      type="number"
                      min="1"
                      max="10000"
                      placeholder={t('pages.screenRegistration.pricePerHourPlaceholder')}
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                      className={getFieldError('price_per_hour') ? 'border-destructive' : ''}
                    />
                    {getFieldError('price_per_hour') && (
                      <p className="text-sm text-destructive">{getFieldError('price_per_hour')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('pages.screenRegistration.platformFeeNote')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="availability_start">{t('pages.screenRegistration.availableFromLabel')}</Label>
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
                      <Label htmlFor="availability_end">{t('pages.screenRegistration.availableUntilLabel')}</Label>
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
                  {t('pages.screenRegistration.qrCodeNote')}
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
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || hasErrors}
                  className="flex-1"
                >
                  {loading ? t('pages.screenRegistration.registering') : t('pages.screenRegistration.registerScreen')}
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