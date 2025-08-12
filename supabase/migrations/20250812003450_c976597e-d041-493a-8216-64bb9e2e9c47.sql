-- Add coordinates to screens for map rendering and proximity features
ALTER TABLE public.screens
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add constraints to ensure valid ranges
ALTER TABLE public.screens
ADD CONSTRAINT screens_latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
ALTER TABLE public.screens
ADD CONSTRAINT screens_longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Index to speed up simple coordinate queries
CREATE INDEX IF NOT EXISTS idx_screens_lat_lng ON public.screens USING btree (latitude, longitude);
