-- Add room_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE SET NULL;

-- Create post-photos bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-photos', 'post-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-photos bucket
CREATE POLICY "post_photos_storage_staff_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-photos'
    AND auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('staff', 'admin')
    )
  );

CREATE POLICY "post_photos_storage_parent_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'post-photos'
    AND auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'parent'
    )
  );
