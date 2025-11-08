-- ============================================
-- CRITICAL SECURITY FIX: Add RLS Policies
-- ============================================
-- This migration fixes critical security vulnerabilities where
-- user profile and payment data were publicly accessible

-- ============================================
-- 1. PROFILES TABLE - User Profile Protection
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile (during registration)
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- ============================================
-- 2. PAYMENTS TABLE - Payment Data Protection
-- ============================================

-- Users can view their own payments
CREATE POLICY "payments_select_own"
ON public.payments
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own payments (during checkout)
CREATE POLICY "payments_insert_own"
ON public.payments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Screen owners can view payments for their screens
CREATE POLICY "payments_select_screen_owner"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN screens s ON s.id = b.screen_id
    WHERE b.id = payments.booking_id
    AND s.owner_user_id = auth.uid()
  )
);

-- Admins can view all payments
CREATE POLICY "payments_select_admin"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);