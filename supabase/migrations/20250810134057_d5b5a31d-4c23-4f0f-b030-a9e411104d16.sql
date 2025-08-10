-- Grant admin role to a specific user (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT '63f0508b-ef11-4920-9407-7ce69d6fb76a'::uuid, 'admin'::public.app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = '63f0508b-ef11-4920-9407-7ce69d6fb76a'::uuid AND role = 'admin'::public.app_role
);
