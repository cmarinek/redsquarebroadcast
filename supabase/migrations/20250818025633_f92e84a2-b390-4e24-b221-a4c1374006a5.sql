-- Regional expansion infrastructure tables

-- Create regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- e.g., 'east_africa', 'west_europe'
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create countries table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES public.regions(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  display_name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  phone_prefix TEXT,
  tax_rate DECIMAL(5,4) DEFAULT 0, -- VAT/GST rate
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create currencies table
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- ISO 4217
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  exchange_rate DECIMAL(15,6) DEFAULT 1.0, -- Rate to USD
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create languages table
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- ISO 639-1
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  direction TEXT DEFAULT 'ltr', -- 'ltr' or 'rtl'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create region_languages junction table
CREATE TABLE public.region_languages (
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  language_id UUID REFERENCES public.languages(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (region_id, language_id)
);

-- Create regional_settings table for region-specific configurations
CREATE TABLE public.regional_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (region_id, key)
);

-- Add region_id to screens table
ALTER TABLE public.screens ADD COLUMN region_id UUID REFERENCES public.regions(id);
ALTER TABLE public.screens ADD COLUMN country_id UUID REFERENCES public.countries(id);

-- Add currency support to existing tables
ALTER TABLE public.screens ADD COLUMN local_currency TEXT DEFAULT 'USD';
ALTER TABLE public.bookings ADD COLUMN local_currency TEXT DEFAULT 'USD';
ALTER TABLE public.bookings ADD COLUMN exchange_rate DECIMAL(15,6) DEFAULT 1.0;
ALTER TABLE public.payments ADD COLUMN local_currency TEXT DEFAULT 'USD';
ALTER TABLE public.payments ADD COLUMN exchange_rate DECIMAL(15,6) DEFAULT 1.0;

-- Enable RLS on new tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to reference data
CREATE POLICY "regions_public_read" ON public.regions FOR SELECT USING (is_active = true);
CREATE POLICY "countries_public_read" ON public.countries FOR SELECT USING (is_active = true);
CREATE POLICY "currencies_public_read" ON public.currencies FOR SELECT USING (is_active = true);
CREATE POLICY "languages_public_read" ON public.languages FOR SELECT USING (is_active = true);
CREATE POLICY "region_languages_public_read" ON public.region_languages FOR SELECT USING (true);

-- Admin-only policies for managing reference data
CREATE POLICY "regions_admin_all" ON public.regions FOR ALL USING (is_admin());
CREATE POLICY "countries_admin_all" ON public.countries FOR ALL USING (is_admin());
CREATE POLICY "currencies_admin_all" ON public.currencies FOR ALL USING (is_admin());
CREATE POLICY "languages_admin_all" ON public.languages FOR ALL USING (is_admin());
CREATE POLICY "region_languages_admin_all" ON public.region_languages FOR ALL USING (is_admin());
CREATE POLICY "regional_settings_admin_all" ON public.regional_settings FOR ALL USING (is_admin());

-- Insert initial regions data
INSERT INTO public.regions (name, code, display_name, timezone) VALUES
  ('East Africa', 'east_africa', 'East Africa', 'Africa/Nairobi'),
  ('East Asia', 'east_asia', 'East Asia', 'Asia/Tokyo'),
  ('East Europe', 'east_europe', 'Eastern Europe', 'Europe/Warsaw'),
  ('West Africa', 'west_africa', 'West Africa', 'Africa/Lagos'),
  ('West Europe', 'west_europe', 'Western Europe', 'Europe/London'),
  ('South Africa', 'south_africa', 'Southern Africa', 'Africa/Johannesburg');

-- Insert initial currencies
INSERT INTO public.currencies (code, name, symbol, exchange_rate) VALUES
  ('USD', 'US Dollar', '$', 1.0),
  ('EUR', 'Euro', '€', 0.85),
  ('GBP', 'British Pound', '£', 0.75),
  ('CNY', 'Chinese Yuan', '¥', 7.2),
  ('JPY', 'Japanese Yen', '¥', 150.0),
  ('KRW', 'South Korean Won', '₩', 1300.0),
  ('ZAR', 'South African Rand', 'R', 18.5),
  ('NGN', 'Nigerian Naira', '₦', 800.0),
  ('GHS', 'Ghanaian Cedi', '₵', 12.0),
  ('KES', 'Kenyan Shilling', 'KSh', 150.0),
  ('PLN', 'Polish Zloty', 'zł', 4.2);

-- Insert initial languages
INSERT INTO public.languages (code, name, display_name) VALUES
  ('en', 'English', 'English'),
  ('es', 'Spanish', 'Español'),
  ('fr', 'French', 'Français'),
  ('de', 'German', 'Deutsch'),
  ('pt', 'Portuguese', 'Português'),
  ('zh', 'Chinese', '中文'),
  ('ja', 'Japanese', '日本語'),
  ('ko', 'Korean', '한국어'),
  ('pl', 'Polish', 'Polski'),
  ('sw', 'Swahili', 'Kiswahili'),
  ('ar', 'Arabic', 'العربية'),
  ('am', 'Amharic', 'አማርኛ'),
  ('yo', 'Yoruba', 'Yorùbá'),
  ('ha', 'Hausa', 'Hausa'),
  ('af', 'Afrikaans', 'Afrikaans'),
  ('zu', 'Zulu', 'isiZulu'),
  ('xh', 'Xhosa', 'isiXhosa');

-- Insert initial countries with their regions
DO $$
DECLARE
  east_africa_id UUID;
  east_asia_id UUID;
  east_europe_id UUID;
  west_africa_id UUID;
  west_europe_id UUID;
  south_africa_id UUID;
BEGIN
  SELECT id INTO east_africa_id FROM public.regions WHERE code = 'east_africa';
  SELECT id INTO east_asia_id FROM public.regions WHERE code = 'east_asia';
  SELECT id INTO east_europe_id FROM public.regions WHERE code = 'east_europe';
  SELECT id INTO west_africa_id FROM public.regions WHERE code = 'west_africa';
  SELECT id INTO west_europe_id FROM public.regions WHERE code = 'west_europe';
  SELECT id INTO south_africa_id FROM public.regions WHERE code = 'south_africa';

  -- East Africa
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix) VALUES
    (east_africa_id, 'Kenya', 'KE', 'Kenya', 'KES', '+254'),
    (east_africa_id, 'Tanzania', 'TZ', 'Tanzania', 'TZS', '+255'),
    (east_africa_id, 'Uganda', 'UG', 'Uganda', 'UGX', '+256'),
    (east_africa_id, 'Rwanda', 'RW', 'Rwanda', 'RWF', '+250'),
    (east_africa_id, 'Ethiopia', 'ET', 'Ethiopia', 'ETB', '+251');

  -- East Asia
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix) VALUES
    (east_asia_id, 'China', 'CN', 'China', 'CNY', '+86'),
    (east_asia_id, 'Japan', 'JP', 'Japan', 'JPY', '+81'),
    (east_asia_id, 'South Korea', 'KR', 'South Korea', 'KRW', '+82'),
    (east_asia_id, 'Taiwan', 'TW', 'Taiwan', 'TWD', '+886'),
    (east_asia_id, 'Hong Kong', 'HK', 'Hong Kong', 'HKD', '+852');

  -- East Europe
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix, tax_rate) VALUES
    (east_europe_id, 'Poland', 'PL', 'Poland', 'PLN', '+48', 0.23),
    (east_europe_id, 'Czech Republic', 'CZ', 'Czech Republic', 'CZK', '+420', 0.21),
    (east_europe_id, 'Hungary', 'HU', 'Hungary', 'HUF', '+36', 0.27),
    (east_europe_id, 'Slovakia', 'SK', 'Slovakia', 'EUR', '+421', 0.20),
    (east_europe_id, 'Romania', 'RO', 'Romania', 'RON', '+40', 0.19);

  -- West Africa
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix) VALUES
    (west_africa_id, 'Nigeria', 'NG', 'Nigeria', 'NGN', '+234'),
    (west_africa_id, 'Ghana', 'GH', 'Ghana', 'GHS', '+233'),
    (west_africa_id, 'Senegal', 'SN', 'Senegal', 'XOF', '+221'),
    (west_africa_id, 'Mali', 'ML', 'Mali', 'XOF', '+223'),
    (west_africa_id, 'Ivory Coast', 'CI', 'Côte d''Ivoire', 'XOF', '+225');

  -- West Europe
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix, tax_rate) VALUES
    (west_europe_id, 'United Kingdom', 'GB', 'United Kingdom', 'GBP', '+44', 0.20),
    (west_europe_id, 'France', 'FR', 'France', 'EUR', '+33', 0.20),
    (west_europe_id, 'Spain', 'ES', 'Spain', 'EUR', '+34', 0.21),
    (west_europe_id, 'Portugal', 'PT', 'Portugal', 'EUR', '+351', 0.23),
    (west_europe_id, 'Netherlands', 'NL', 'Netherlands', 'EUR', '+31', 0.21);

  -- South Africa
  INSERT INTO public.countries (region_id, name, code, display_name, currency_code, phone_prefix, tax_rate) VALUES
    (south_africa_id, 'South Africa', 'ZA', 'South Africa', 'ZAR', '+27', 0.15),
    (south_africa_id, 'Botswana', 'BW', 'Botswana', 'BWP', '+267', 0.12),
    (south_africa_id, 'Namibia', 'NA', 'Namibia', 'NAD', '+264', 0.15),
    (south_africa_id, 'Zimbabwe', 'ZW', 'Zimbabwe', 'USD', '+263', 0.00);
END $$;

-- Create triggers for updated_at
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON public.currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regional_settings_updated_at BEFORE UPDATE ON public.regional_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();