import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Language, Region, Country, Currency, DirectionType } from '@/types';

interface LanguageContextType {
  currentLanguage: string;
  languages: Language[];
  regions: Region[];
  countries: Country[];
  currencies: Currency[];
  selectedRegion: Region | null;
  selectedCountry: Country | null;
  selectedCurrency: Currency | null;
  changeLanguage: (langCode: string) => void;
  setSelectedRegion: (region: Region | null) => void;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedCurrency: (currency: Currency | null) => void;
  loading: boolean;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  detectUserLocation: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all regional data in parallel
      const [
        { data: languagesData },
        { data: regionsData },
        { data: countriesData },
        { data: currenciesData }
      ] = await Promise.all([
        supabase.from('languages').select('*').eq('is_active', true),
        supabase.from('regions').select('*').eq('is_active', true),
        supabase.from('countries').select('*').eq('is_active', true),
        supabase.from('currencies').select('*').eq('is_active', true)
      ]);

        setLanguages((languagesData || []).map(lang => ({
          ...lang,
          direction: lang.direction as DirectionType
        })));
      if (regionsData) setRegions(regionsData);
      if (countriesData) setCountries(countriesData);
      if (currenciesData) setCurrencies(currenciesData);

      // Set default currency to USD if no currency is selected
      if (currenciesData && !selectedCurrency) {
        const usd = currenciesData.find(c => c.code === 'USD');
        if (usd) setSelectedCurrency(usd);
      }

    } catch (error) {
      console.error('Error loading regional data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCurrency]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load saved preferences
  useEffect(() => {
    const savedRegion = localStorage.getItem('selectedRegion');
    const savedCountry = localStorage.getItem('selectedCountry');
    const savedCurrency = localStorage.getItem('selectedCurrency');

    if (savedRegion && regions.length > 0) {
      const region = regions.find(r => r.code === savedRegion);
      if (region) setSelectedRegion(region);
    }

    if (savedCountry && countries.length > 0) {
      const country = countries.find(c => c.code === savedCountry);
      if (country) setSelectedCountry(country);
    }

    if (savedCurrency && currencies.length > 0) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) setSelectedCurrency(currency);
    }
  }, [regions, countries, currencies]);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
  };

  const handleSetSelectedRegion = (region: Region | null) => {
    setSelectedRegion(region);
    if (region) {
      localStorage.setItem('selectedRegion', region.code);
    } else {
      localStorage.removeItem('selectedRegion');
    }
  };

  const handleSetSelectedCountry = (country: Country | null) => {
    setSelectedCountry(country);
    if (country) {
      localStorage.setItem('selectedCountry', country.code);
      // Auto-set currency based on country
      const countryCurrency = currencies.find(c => c.code === country.currency_code);
      if (countryCurrency) {
        setSelectedCurrency(countryCurrency);
        localStorage.setItem('selectedCurrency', countryCurrency.code);
      }
    } else {
      localStorage.removeItem('selectedCountry');
    }
  };

  const handleSetSelectedCurrency = (currency: Currency | null) => {
    setSelectedCurrency(currency);
    if (currency) {
      localStorage.setItem('selectedCurrency', currency.code);
    } else {
      localStorage.removeItem('selectedCurrency');
    }
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode ? 
      currencies.find(c => c.code === currencyCode) || selectedCurrency :
      selectedCurrency;
    
    if (!currency) {
      return `$${amount.toFixed(2)}`;
    }

    const convertedAmount = currencyCode && currencyCode !== selectedCurrency?.code ?
      amount * (currencies.find(c => c.code === currencyCode)?.exchange_rate || 1) :
      amount;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimal_places,
      maximumFractionDigits: currency.decimal_places,
    }).format(convertedAmount);
  };

  const detectUserLocation = async (): Promise<void> => {
    try {
      // Try to detect user's location using browser API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Use a geocoding service to determine country
            // For now, we'll implement a simple fallback
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            if (data.countryCode) {
              const country = countries.find(c => c.code === data.countryCode);
              if (country) {
                handleSetSelectedCountry(country);
                const region = regions.find(r => r.id === country.region_id);
                if (region) {
                  handleSetSelectedRegion(region);
                }
              }
            }
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Fallback to browser language detection
            const browserLang = navigator.language.split('-')[0];
            const availableLang = languages.find(l => l.code === browserLang);
            if (availableLang) {
              changeLanguage(availableLang.code);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error detecting user location:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage: i18n.language,
    languages,
    regions,
    countries,
    currencies,
    selectedRegion,
    selectedCountry,
    selectedCurrency,
    changeLanguage,
    setSelectedRegion: handleSetSelectedRegion,
    setSelectedCountry: handleSetSelectedCountry,
    setSelectedCurrency: handleSetSelectedCurrency,
    loading,
    formatCurrency,
    detectUserLocation,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};