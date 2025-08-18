import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegionalSelector } from '@/components/RegionalSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, DollarSign, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { useRegional } from '@/hooks/useRegional';

const RegionalSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    selectedRegion,
    selectedCountry,
    selectedCurrency,
    detectUserLocation,
    loading: languageLoading
  } = useLanguage();
  
  const {
    regionalSettings,
    loading: regionalLoading,
    getSupportedPaymentMethods,
    getTaxInfo,
    formatLocalPrice,
    getRegionalizedDate,
    getRegionalizedTime,
    refreshSettings
  } = useRegional();

  const taxInfo = getTaxInfo();
  const paymentMethods = getSupportedPaymentMethods();

  if (languageLoading || regionalLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">{t('common.loading')}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t('regional.selectRegion')}</h1>
            <p className="text-muted-foreground">
              Customize your Red Square experience for your region
            </p>
          </div>

          {/* Regional Selector */}
          <div className="flex justify-center">
            <RegionalSelector />
          </div>

          {/* Current Settings Overview */}
          {(selectedRegion || selectedCountry || selectedCurrency) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Current Regional Settings
                </CardTitle>
                <CardDescription>
                  Your current location and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRegion && (
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t('regional.region')}</div>
                        <div className="text-sm text-muted-foreground">
                          {t(`regional.regions.${selectedRegion.code}`, selectedRegion.display_name)}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCountry && (
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <Globe className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t('regional.country')}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCountry.display_name}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCurrency && (
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <DollarSign className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t('regional.currency')}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCurrency.symbol} {selectedCurrency.code}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRegion && (
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t('regional.timezone')}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedRegion.timezone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={detectUserLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Auto-detect Location
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshSettings}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Regional Features */}
          {regionalSettings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing & Currency */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Currency</CardTitle>
                  <CardDescription>
                    Local pricing and currency settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Sample pricing (10 seconds):</span>
                    <Badge variant="secondary">{formatLocalPrice(5.00)}</Badge>
                  </div>
                  
                  {taxInfo && (
                    <div className="flex justify-between">
                      <span className="text-sm">Tax rate ({taxInfo.name}):</span>
                      <Badge variant="outline">{(taxInfo.rate * 100).toFixed(1)}%</Badge>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Price includes tax:</span>
                    <Badge variant={taxInfo?.included ? "default" : "secondary"}>
                      {taxInfo?.included ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Supported payment options in your region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <Badge key={method} variant="outline" className="mr-2">
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time & Date */}
              <Card>
                <CardHeader>
                  <CardTitle>Time & Date Format</CardTitle>
                  <CardDescription>
                    Regional time and date display
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Current date:</span>
                    <span className="text-sm font-medium">
                      {getRegionalizedDate(new Date())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current time:</span>
                    <span className="text-sm font-medium">
                      {getRegionalizedTime(new Date())}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Regional business settings and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {regionalSettings.business_hours && (
                    <div className="flex justify-between">
                      <span className="text-sm">Business hours:</span>
                      <span className="text-sm font-medium">
                        {regionalSettings.business_hours.start} - {regionalSettings.business_hours.end}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Content moderation:</span>
                    <Badge variant="outline">
                      {regionalSettings.content_moderation_level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RegionalSettings;