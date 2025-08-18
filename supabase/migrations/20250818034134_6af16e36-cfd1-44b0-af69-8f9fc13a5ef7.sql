-- First, let's add the missing display_name column to regions table
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS display_name text;

-- Update existing regions to have display_name
UPDATE public.regions SET display_name = name WHERE display_name IS NULL;

-- Make display_name NOT NULL after populating it
ALTER TABLE public.regions ALTER COLUMN display_name SET NOT NULL;

-- Now add our regional data for the requested regions and countries
-- Clear existing data and insert fresh
DELETE FROM public.regions WHERE code IN ('east_africa', 'east_asia', 'east_europe', 'west_africa', 'west_europe', 'south_africa');

-- Insert regions with proper display_name
INSERT INTO public.regions (name, code, display_name, timezone, is_active) VALUES
('East Africa', 'east_africa', 'East Africa', 'Africa/Nairobi', true),
('East Asia', 'east_asia', 'East Asia', 'Asia/Tokyo', true),
('East Europe', 'east_europe', 'East Europe', 'Europe/Warsaw', true),
('West Africa', 'west_africa', 'West Africa', 'Africa/Lagos', true),
('West Europe', 'west_europe', 'West Europe', 'Europe/London', true),
('South Africa', 'south_africa', 'South Africa', 'Africa/Johannesburg', true);

-- Get region IDs for foreign key references
WITH region_ids AS (
  SELECT id, code FROM public.regions WHERE code IN ('east_africa', 'east_asia', 'east_europe', 'west_africa', 'west_europe', 'south_africa')
)
-- Insert countries for each region
INSERT INTO public.countries (name, code, display_name, currency_code, tax_rate, phone_prefix, region_id, is_active) 
SELECT * FROM (VALUES
  -- East Africa
  ('Kenya', 'KE', 'Kenya', 'KES', 0.16, '+254', (SELECT id FROM region_ids WHERE code = 'east_africa')),
  ('Tanzania', 'TZ', 'Tanzania', 'TZS', 0.18, '+255', (SELECT id FROM region_ids WHERE code = 'east_africa')),
  ('Uganda', 'UG', 'Uganda', 'UGX', 0.18, '+256', (SELECT id FROM region_ids WHERE code = 'east_africa')),
  ('Rwanda', 'RW', 'Rwanda', 'RWF', 0.18, '+250', (SELECT id FROM region_ids WHERE code = 'east_africa')),
  ('Ethiopia', 'ET', 'Ethiopia', 'ETB', 0.15, '+251', (SELECT id FROM region_ids WHERE code = 'east_africa')),
  
  -- East Asia
  ('Japan', 'JP', 'Japan', 'JPY', 0.10, '+81', (SELECT id FROM region_ids WHERE code = 'east_asia')),
  ('South Korea', 'KR', 'South Korea', 'KRW', 0.10, '+82', (SELECT id FROM region_ids WHERE code = 'east_asia')),
  ('China', 'CN', 'China', 'CNY', 0.13, '+86', (SELECT id FROM region_ids WHERE code = 'east_asia')),
  ('Taiwan', 'TW', 'Taiwan', 'TWD', 0.05, '+886', (SELECT id FROM region_ids WHERE code = 'east_asia')),
  ('Hong Kong', 'HK', 'Hong Kong', 'HKD', 0.00, '+852', (SELECT id FROM region_ids WHERE code = 'east_asia')),
  
  -- East Europe
  ('Poland', 'PL', 'Poland', 'PLN', 0.23, '+48', (SELECT id FROM region_ids WHERE code = 'east_europe')),
  ('Czech Republic', 'CZ', 'Czech Republic', 'CZK', 0.21, '+420', (SELECT id FROM region_ids WHERE code = 'east_europe')),
  ('Hungary', 'HU', 'Hungary', 'HUF', 0.27, '+36', (SELECT id FROM region_ids WHERE code = 'east_europe')),
  ('Slovakia', 'SK', 'Slovakia', 'EUR', 0.20, '+421', (SELECT id FROM region_ids WHERE code = 'east_europe')),
  ('Romania', 'RO', 'Romania', 'RON', 0.19, '+40', (SELECT id FROM region_ids WHERE code = 'east_europe')),
  
  -- West Africa
  ('Nigeria', 'NG', 'Nigeria', 'NGN', 0.075, '+234', (SELECT id FROM region_ids WHERE code = 'west_africa')),
  ('Ghana', 'GH', 'Ghana', 'GHS', 0.125, '+233', (SELECT id FROM region_ids WHERE code = 'west_africa')),
  ('Senegal', 'SN', 'Senegal', 'XOF', 0.18, '+221', (SELECT id FROM region_ids WHERE code = 'west_africa')),
  ('Ivory Coast', 'CI', 'Ivory Coast', 'XOF', 0.18, '+225', (SELECT id FROM region_ids WHERE code = 'west_africa')),
  ('Mali', 'ML', 'Mali', 'XOF', 0.18, '+223', (SELECT id FROM region_ids WHERE code = 'west_africa')),
  
  -- West Europe
  ('United Kingdom', 'GB', 'United Kingdom', 'GBP', 0.20, '+44', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  ('France', 'FR', 'France', 'EUR', 0.20, '+33', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  ('Germany', 'DE', 'Germany', 'EUR', 0.19, '+49', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  ('Spain', 'ES', 'Spain', 'EUR', 0.21, '+34', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  ('Italy', 'IT', 'Italy', 'EUR', 0.22, '+39', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  ('Netherlands', 'NL', 'Netherlands', 'EUR', 0.21, '+31', (SELECT id FROM region_ids WHERE code = 'west_europe')),
  
  -- South Africa
  ('South Africa', 'ZA', 'South Africa', 'ZAR', 0.15, '+27', (SELECT id FROM region_ids WHERE code = 'south_africa')),
  ('Botswana', 'BW', 'Botswana', 'BWP', 0.14, '+267', (SELECT id FROM region_ids WHERE code = 'south_africa')),
  ('Namibia', 'NA', 'Namibia', 'NAD', 0.15, '+264', (SELECT id FROM region_ids WHERE code = 'south_africa')),
  ('Zambia', 'ZM', 'Zambia', 'ZMW', 0.16, '+260', (SELECT id FROM region_ids WHERE code = 'south_africa')),
  ('Zimbabwe', 'ZW', 'Zimbabwe', 'USD', 0.15, '+263', (SELECT id FROM region_ids WHERE code = 'south_africa'))
) AS new_countries(name, code, display_name, currency_code, tax_rate, phone_prefix, region_id)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  currency_code = EXCLUDED.currency_code,
  tax_rate = EXCLUDED.tax_rate,
  phone_prefix = EXCLUDED.phone_prefix,
  region_id = EXCLUDED.region_id;

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