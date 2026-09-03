-- Create profile trigger: AFTER INSERT on auth.users creates a row in public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, daycare_id, role, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'daycare_id')::uuid,
    (NEW.raw_user_meta_data->>'role')::user_role,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'status')::user_status, 'active'::user_status)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
