-- Reset password admin & confirm email
UPDATE auth.users
SET 
  encrypted_password = crypt('admin@123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email = 'adminpaud@genqupa.co.id';

-- Pastikan role admin ada
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'adminpaud@genqupa.co.id'
ON CONFLICT DO NOTHING;

-- Pastikan profile ada
INSERT INTO public.profiles (user_id, name, phone)
SELECT id, 'Admin PAUD', '0000000000'
FROM auth.users
WHERE email = 'adminpaud@genqupa.co.id'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.users.id);