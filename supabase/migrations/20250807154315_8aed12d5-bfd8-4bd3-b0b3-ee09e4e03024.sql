-- Create the missing app_role enum type
CREATE TYPE public.app_role AS ENUM ('broadcaster', 'screen_owner', 'admin');