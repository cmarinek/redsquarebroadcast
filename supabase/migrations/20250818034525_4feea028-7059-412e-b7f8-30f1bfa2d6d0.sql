-- Add missing display_name column to regions table
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS display_name text;

-- Update existing regions to have display_name
UPDATE public.regions SET display_name = name WHERE display_name IS NULL;

-- Make display_name NOT NULL after populating it
ALTER TABLE public.regions ALTER COLUMN display_name SET NOT NULL;

-- Insert new regions (without deleting existing ones)
INSERT INTO public.regions (name, code, display_name, timezone, is_active) VALUES
('East Africa', 'east_africa', 'East Africa', 'Africa/Nairobi', true),
('East Asia', 'east_asia', 'East Asia', 'Asia/Tokyo', true),
('East Europe', 'east_europe', 'East Europe', 'Europe/Warsaw', true),
('West Africa', 'west_africa', 'West Africa', 'Africa/Lagos', true),
('West Europe', 'west_europe', 'West Europe', 'Europe/London', true),
('South Africa', 'south_africa', 'South Africa', 'Africa/Johannesburg', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  timezone = EXCLUDED.timezone,
  is_active = EXCLUDED.is_active;

-- Insert countries for each region
-- First, get region mapping
DO $$
DECLARE
    east_africa_id UUID;
    east_asia_id UUID;
    east_europe_id UUID;
    west_africa_id UUID;
    west_europe_id UUID;
    south_africa_id UUID;
BEGIN
    -- Get region IDs
    SELECT id INTO east_africa_id FROM public.regions WHERE code = 'east_africa';
    SELECT id INTO east_asia_id FROM public.regions WHERE code = 'east_asia';
    SELECT id INTO east_europe_id FROM public.regions WHERE code = 'east_europe';
    SELECT id INTO west_africa_id FROM public.regions WHERE code = 'west_africa';
    SELECT id INTO west_europe_id FROM public.regions WHERE code = 'west_europe';
    SELECT id INTO south_africa_id FROM public.regions WHERE code = 'south_africa';

    -- Insert countries for East Africa
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('Kenya', 'KE', 'Kenya', 'KES', 0.16, '+254', east_africa_id, true),
    ('Tanzania', 'TZ', 'Tanzania', 'TZS', 0.18, '+255', east_africa_id, true),
    ('Uganda', 'UG', 'Uganda', 'UGX', 0.18, '+256', east_africa_id, true),
    ('Rwanda', 'RW', 'Rwanda', 'RWF', 0.18, '+250', east_africa_id, true),
    ('Ethiopia', 'ET', 'Ethiopia', 'ETB', 0.15, '+251', east_africa_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;

    -- Insert countries for East Asia
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('Japan', 'JP', 'Japan', 'JPY', 0.10, '+81', east_asia_id, true),
    ('South Korea', 'KR', 'South Korea', 'KRW', 0.10, '+82', east_asia_id, true),
    ('China', 'CN', 'China', 'CNY', 0.13, '+86', east_asia_id, true),
    ('Taiwan', 'TW', 'Taiwan', 'TWD', 0.05, '+886', east_asia_id, true),
    ('Hong Kong', 'HK', 'Hong Kong', 'HKD', 0.00, '+852', east_asia_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;

    -- Insert countries for East Europe  
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('Poland', 'PL', 'Poland', 'PLN', 0.23, '+48', east_europe_id, true),
    ('Czech Republic', 'CZ', 'Czech Republic', 'CZK', 0.21, '+420', east_europe_id, true),
    ('Hungary', 'HU', 'Hungary', 'HUF', 0.27, '+36', east_europe_id, true),
    ('Slovakia', 'SK', 'Slovakia', 'EUR', 0.20, '+421', east_europe_id, true),
    ('Romania', 'RO', 'Romania', 'RON', 0.19, '+40', east_europe_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;

    -- Insert countries for West Africa
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('Nigeria', 'NG', 'Nigeria', 'NGN', 0.075, '+234', west_africa_id, true),
    ('Ghana', 'GH', 'Ghana', 'GHS', 0.125, '+233', west_africa_id, true),
    ('Senegal', 'SN', 'Senegal', 'XOF', 0.18, '+221', west_africa_id, true),
    ('Ivory Coast', 'CI', 'Ivory Coast', 'XOF', 0.18, '+225', west_africa_id, true),
    ('Mali', 'ML', 'Mali', 'XOF', 0.18, '+223', west_africa_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;

    -- Insert countries for West Europe
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('United Kingdom', 'GB', 'United Kingdom', 'GBP', 0.20, '+44', west_europe_id, true),
    ('France', 'FR', 'France', 'EUR', 0.20, '+33', west_europe_id, true),
    ('Germany', 'DE', 'Germany', 'EUR', 0.19, '+49', west_europe_id, true),
    ('Spain', 'ES', 'Spain', 'EUR', 0.21, '+34', west_europe_id, true),
    ('Italy', 'IT', 'Italy', 'EUR', 0.22, '+39', west_europe_id, true),
    ('Netherlands', 'NL', 'Netherlands', 'EUR', 0.21, '+31', west_europe_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;

    -- Insert countries for South Africa
    INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) VALUES
    ('South Africa', 'ZA', 'South Africa', 'ZAR', 0.15, '+27', south_africa_id, true),
    ('Botswana', 'BW', 'Botswana', 'BWP', 0.14, '+267', south_africa_id, true),
    ('Namibia', 'NA', 'Namibia', 'NAD', 0.15, '+264', south_africa_id, true),
    ('Zambia', 'ZM', 'Zambia', 'ZMW', 0.16, '+260', south_africa_id, true),
    ('Zimbabwe', 'ZW', 'Zimbabwe', 'USD', 0.15, '+263', south_africa_id, true)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      display_name = EXCLUDED.display_name,
      currency_code = EXCLUDED.currency_code,
      tax_rate = EXCLUDED.tax_rate,
      phone_prefix = EXCLUDED.phone_prefix,
      region_id = EXCLUDED.region_id;
END
$$;

-- Insert currencies for the new regions
INSERT INTO public.currencies (code, name, symbol, decimal_places, exchange_rate, is_active) VALUES
('KES', 'Kenyan Shilling', 'KSh', 2, 0.0077, true),
('TZS', 'Tanzanian Shilling', 'TSh', 2, 0.00040, true),
('UGX', 'Ugandan Shilling', 'USh', 0, 0.00027, true),
('RWF', 'Rwandan Franc', 'RWF', 0, 0.00078, true),
('ETB', 'Ethiopian Birr', 'ETB', 2, 0.018, true),
('JPY', 'Japanese Yen', '¥', 0, 0.0067, true),
('KRW', 'South Korean Won', '₩', 0, 0.00075, true),
('CNY', 'Chinese Yuan', '¥', 2, 0.14, true),
('TWD', 'Taiwan Dollar', 'NT$', 2, 0.031, true),
('HKD', 'Hong Kong Dollar', 'HK$', 2, 0.13, true),
('PLN', 'Polish Złoty', 'zł', 2, 0.25, true),
('CZK', 'Czech Koruna', 'Kč', 2, 0.044, true),
('HUF', 'Hungarian Forint', 'Ft', 0, 0.0027, true),
('RON', 'Romanian Leu', 'lei', 2, 0.21, true),
('NGN', 'Nigerian Naira', '₦', 2, 0.00061, true),
('GHS', 'Ghanaian Cedi', 'GH₵', 2, 0.063, true),
('XOF', 'West African CFA Franc', 'CFA', 0, 0.0016, true),
('ZAR', 'South African Rand', 'R', 2, 0.055, true),
('BWP', 'Botswana Pula', 'P', 2, 0.074, true),
('NAD', 'Namibian Dollar', 'N$', 2, 0.055, true),
('ZMW', 'Zambian Kwacha', 'ZK', 2, 0.037, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  decimal_places = EXCLUDED.decimal_places,
  exchange_rate = EXCLUDED.exchange_rate,
  is_active = EXCLUDED.is_active;