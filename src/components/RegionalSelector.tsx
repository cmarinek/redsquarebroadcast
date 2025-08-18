import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MapPin, DollarSign, Clock } from 'lucide-react';

interface RegionalSelectorProps {
  compact?: boolean;
  showLanguageOnly?: boolean;
}

export const RegionalSelector: React.FC<RegionalSelectorProps> = ({ 
  compact = false, 
  showLanguageOnly = false 
}) => {
  const { t, i18n } = useTranslation();
  const {
    languages,
    regions,
    countries,
    currencies,
    selectedRegion,
    selectedCountry,
    selectedCurrency,
    changeLanguage,
    setSelectedRegion,
    setSelectedCountry,
    setSelectedCurrency,
    loading,
    detectUserLocation
  } = useLanguage();

  const filteredCountries = selectedRegion 
    ? countries.filter(c => c.region_id === selectedRegion.id)
    : countries;

  if (loading) {
    return (
      <Card className={compact ? "w-64" : "w-full max-w-md"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">{t('translation.common.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showLanguageOnly) {
    return (
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className={compact ? "w-32" : "w-48"}>
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.id} value={lang.code}>
              {lang.display_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Select value={i18n.language} onValueChange={changeLanguage}>
          <SelectTrigger className="w-32">
            <Globe className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.code}>
                {lang.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedRegion?.code || ''} 
          onValueChange={(value) => {
            const region = regions.find(r => r.code === value);
            setSelectedRegion(region || null);
          }}
        >
          <SelectTrigger className="w-36">
            <MapPin className="h-4 w-4 mr-1" />
            <SelectValue placeholder={t('regional.selectRegion')} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.code}>
                {t(`regional.regions.${region.code}`, region.display_name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCurrency && (
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            {selectedCurrency.code}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">{t('regional.selectRegion')}</CardTitle>
        <CardDescription>
          Choose your region and preferences for the best experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-detect button */}
        <Button 
          variant="outline" 
          onClick={detectUserLocation}
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Auto-detect Location
        </Button>

        {/* Language selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('regional.language')}</label>
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger>
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.code}>
                  {lang.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('regional.region')}</label>
          <Select 
            value={selectedRegion?.code || ''} 
            onValueChange={(value) => {
              const region = regions.find(r => r.code === value);
              setSelectedRegion(region || null);
              // Clear country selection when region changes
              setSelectedCountry(null);
            }}
          >
            <SelectTrigger>
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('regional.selectRegion')} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.code}>
                  {t(`regional.regions.${region.code}`, region.display_name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country selector */}
        {selectedRegion && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('regional.country')}</label>
            <Select 
              value={selectedCountry?.code || ''} 
              onValueChange={(value) => {
                const country = filteredCountries.find(c => c.code === value);
                setSelectedCountry(country || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('regional.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {filteredCountries.map((country) => (
                  <SelectItem key={country.id} value={country.code}>
                    {country.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Currency selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('regional.currency')}</label>
          <Select 
            value={selectedCurrency?.code || ''} 
            onValueChange={(value) => {
              const currency = currencies.find(c => c.code === value);
              setSelectedCurrency(currency || null);
            }}
          >
            <SelectTrigger>
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current selection summary */}
        {(selectedRegion || selectedCountry || selectedCurrency) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Current Selection:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {selectedRegion && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-2" />
                  {selectedRegion.display_name}
                </div>
              )}
              {selectedCountry && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-2" />
                  {selectedCountry.display_name}
                </div>
              )}
              {selectedCurrency && (
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-2" />
                  {selectedCurrency.symbol} {selectedCurrency.code}
                </div>
              )}
              {selectedRegion && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  {selectedRegion.timezone}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};