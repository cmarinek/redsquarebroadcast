import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface RegionalData {
  regions: any[];
  countries: any[];
  currencies: any[];
  languages: any[];
}

interface RegionalSettings {
  pricing_adjustment_factor: number;
  supported_payment_methods: string[];
  content_moderation_level: 'low' | 'medium' | 'high';
  compliance_requirements: string[];
  local_holidays: any[];
  business_hours: {
    start: string;
    end: string;
  };
  tax_settings: {
    include_tax: boolean;
    tax_rate: number;
    tax_name: string;
  };
}

export const useRegional = () => {
  const {
    selectedRegion,
    selectedCountry,
    selectedCurrency,
    formatCurrency,
    loading: languageLoading
  } = useLanguage();

  const [regionalSettings, setRegionalSettings] = useState<RegionalSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRegion) {
      loadRegionalSettings();
    }
  }, [selectedRegion]);

  const loadRegionalSettings = async () => {
    if (!selectedRegion) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('regional_settings')
        .select('*')
        .eq('region_id', selectedRegion.id);

      if (error) throw error;

      // Convert array of key-value pairs to settings object
      const settings: Record<string, any> = {};
      data?.forEach((item) => {
        settings[item.key] = item.value;
      });

      // Set defaults for missing settings
      const defaultSettings: RegionalSettings = {
        pricing_adjustment_factor: 1.0,
        supported_payment_methods: ['stripe', 'paypal'],
        content_moderation_level: 'medium',
        compliance_requirements: [],
        local_holidays: [],
        business_hours: {
          start: '09:00',
          end: '17:00'
        },
        tax_settings: {
          include_tax: selectedCountry?.tax_rate ? selectedCountry.tax_rate > 0 : false,
          tax_rate: selectedCountry?.tax_rate || 0,
          tax_name: 'VAT'
        },
        ...settings
      };

      setRegionalSettings(defaultSettings);

    } catch (error) {
      console.error('Error loading regional settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalPrice = (basePrice: number, currencyCode?: string): number => {
    const adjustmentFactor = regionalSettings?.pricing_adjustment_factor || 1.0;
    const exchangeRate = currencyCode ? 
      (selectedCurrency?.exchange_rate || 1) : 1;
    
    return basePrice * adjustmentFactor * exchangeRate;
  };

  const formatLocalPrice = (basePrice: number, includeTax: boolean = false): string => {
    const localPrice = calculateLocalPrice(basePrice);
    const taxRate = regionalSettings?.tax_settings?.tax_rate || 0;
    const finalPrice = includeTax && taxRate > 0 ? 
      localPrice * (1 + taxRate) : localPrice;
    
    return formatCurrency(finalPrice);
  };

  const isPaymentMethodSupported = (method: string): boolean => {
    return regionalSettings?.supported_payment_methods?.includes(method) || false;
  };

  const getSupportedPaymentMethods = (): string[] => {
    return regionalSettings?.supported_payment_methods || ['stripe'];
  };

  const isBusinessHours = (time?: Date): boolean => {
    if (!regionalSettings?.business_hours || !selectedRegion) return true;
    
    const checkTime = time || new Date();
    const timeString = checkTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: selectedRegion.timezone 
    });
    
    const { start, end } = regionalSettings.business_hours;
    return timeString >= start && timeString <= end;
  };

  const getLocalHolidays = () => {
    return regionalSettings?.local_holidays || [];
  };

  const getComplianceRequirements = (): string[] => {
    return regionalSettings?.compliance_requirements || [];
  };

  const getTaxInfo = () => {
    if (!regionalSettings?.tax_settings || !selectedCountry) {
      return null;
    }

    return {
      rate: regionalSettings.tax_settings.tax_rate,
      name: regionalSettings.tax_settings.tax_name,
      included: regionalSettings.tax_settings.include_tax,
      country: selectedCountry.display_name
    };
  };

  const formatPhoneNumber = (number: string): string => {
    if (!selectedCountry?.phone_prefix) return number;
    
    // Simple phone number formatting
    const cleaned = number.replace(/\D/g, '');
    const prefix = selectedCountry.phone_prefix.replace('+', '');
    
    if (cleaned.startsWith(prefix)) {
      return `+${cleaned}`;
    }
    
    return `${selectedCountry.phone_prefix}${cleaned}`;
  };

  const getRegionalizedDate = (date: Date): string => {
    if (!selectedRegion) return date.toLocaleDateString();
    
    return date.toLocaleDateString('en-US', {
      timeZone: selectedRegion.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRegionalizedTime = (date: Date): string => {
    if (!selectedRegion) return date.toLocaleTimeString();
    
    return date.toLocaleTimeString('en-US', {
      timeZone: selectedRegion.timezone,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    // Regional data
    selectedRegion,
    selectedCountry,
    selectedCurrency,
    regionalSettings,
    
    // Loading states
    loading: loading || languageLoading,
    
    // Pricing functions
    calculateLocalPrice,
    formatLocalPrice,
    formatCurrency,
    
    // Payment functions
    isPaymentMethodSupported,
    getSupportedPaymentMethods,
    
    // Business logic
    isBusinessHours,
    getLocalHolidays,
    getComplianceRequirements,
    getTaxInfo,
    
    // Formatting functions
    formatPhoneNumber,
    getRegionalizedDate,
    getRegionalizedTime,
    
    // Utility functions
    refreshSettings: loadRegionalSettings
  };
};