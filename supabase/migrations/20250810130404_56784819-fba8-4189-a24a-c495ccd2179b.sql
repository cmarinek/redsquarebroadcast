
-- 1) Create enum for roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('broadcaster', 'screen_owner', 'admin');
  END IF;
END$$;

-- 2) Create user_roles table (many-to-many roles per user)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3) Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) Helper to check roles (SECURITY DEFINER to avoid recursion issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 5) Update is_admin() to use user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

-- 6) Prevent removing/demoting the last admin
CREATE OR REPLACE FUNCTION public.prevent_last_admin_loss_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  admin_count integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin' THEN
      SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
      IF admin_count <= 1 THEN
        RAISE EXCEPTION 'Cannot remove the last admin role';
      END IF;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'admin' AND NEW.role <> 'admin' THEN
      SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
      IF admin_count <= 1 THEN
        RAISE EXCEPTION 'Cannot demote the last admin role';
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_loss_roles ON public.user_roles;
CREATE TRIGGER trg_prevent_last_admin_loss_roles
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_loss_roles();

-- 7) RLS policies
-- Allow users to read their own roles; admins can read all
DROP POLICY IF EXISTS user_roles_select ON public.user_roles;
CREATE POLICY user_roles_select
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Allow users to self-assign non-admin roles (broadcaster/screen_owner) for themselves
DROP POLICY IF EXISTS user_roles_insert_self_non_admin ON public.user_roles;
CREATE POLICY user_roles_insert_self_non_admin
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND role IN ('broadcaster'::public.app_role, 'screen_owner'::public.app_role)
);

-- Admins can insert any role for any user (including admin)
DROP POLICY IF EXISTS user_roles_admin_insert_any ON public.user_roles;
CREATE POLICY user_roles_admin_insert_any
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow users to remove their own non-admin roles
DROP POLICY IF EXISTS user_roles_delete_self_non_admin ON public.user_roles;
CREATE POLICY user_roles_delete_self_non_admin
ON public.user_roles
FOR DELETE
USING (
  user_id = auth.uid()
  AND role IN ('broadcaster'::public.app_role, 'screen_owner'::public.app_role)
);

-- Admins can delete any role
DROP POLICY IF EXISTS user_roles_admin_delete_any ON public.user_roles;
CREATE POLICY user_roles_admin_delete_any
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update role rows (prevent self-escalation by UPDATE)
DROP POLICY IF EXISTS user_roles_admin_update_any ON public.user_roles;
CREATE POLICY user_roles_admin_update_any
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8) Backfill roles from existing data
-- 8a) From profiles.role when it matches known roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role::public.app_role
FROM public.profiles p
WHERE p.role IN ('admin', 'broadcaster', 'screen_owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- 8b) Any screen owner in screens table should have 'screen_owner'
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT s.owner_user_id, 'screen_owner'::public.app_role
FROM public.screens s
WHERE s.owner_user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8c) Anyone who has uploaded content is a 'broadcaster'
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT cu.user_id, 'broadcaster'::public.app_role
FROM public.content_uploads cu
WHERE cu.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Warn if there are no admins after backfill
DO $$
DECLARE
  cnt integer;
BEGIN
  SELECT count(*) INTO cnt FROM public.user_roles WHERE role = 'admin';
  IF cnt = 0 THEN
    RAISE WARNING 'No admin users found in user_roles. Use SQL to grant admin to at least one user.';
  END IF;
END$$;
