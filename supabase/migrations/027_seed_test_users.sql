-- Seed: usuarios de prueba staff + admin con Supabase Auth real
-- Emails confirmados, passwords hasheadas, raw_user_meta_data con rol y daycare

-- Limpiar usuarios existentes por email (incluye cascada a public.users via FK)
DELETE FROM auth.users WHERE email IN ('caro@guarderia.com', 'admin@guarderia.com');

-- Staff: caro@guarderia.com
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'caro@guarderia.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"daycare_id": "a0000000-0000-0000-0000-000000000001", "role": "staff", "full_name": "Caro Giménez"}',
  NOW(),
  NOW(),
  FALSE,
  FALSE
);

-- Admin: admin@guarderia.com
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'admin@guarderia.com',
  crypt('Test1234!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"daycare_id": "a0000000-0000-0000-0000-000000000001", "role": "admin", "full_name": "Admin Soles"}',
  NOW(),
  NOW(),
  FALSE,
  FALSE
);
