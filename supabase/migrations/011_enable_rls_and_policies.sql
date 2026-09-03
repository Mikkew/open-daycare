-- Enable RLS and policies on all tables

-- Enable RLS
ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_allergy_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function to get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_daycare_id()
RETURNS uuid AS $$
  SELECT daycare_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- daycares: read-only for members of the same daycare
-- ============================================================
CREATE POLICY "daycares_read_own"
  ON daycares FOR SELECT
  USING (id = public.get_current_user_daycare_id());

-- ============================================================
-- users: staff can CRUD, parents can read users of their daycare
-- ============================================================
CREATE POLICY "users_staff_crud"
  ON users FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "users_parent_read_own_daycare"
  ON users FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND daycare_id = public.get_current_user_daycare_id()
  );

-- ============================================================
-- rooms: read-only for members of the same daycare
-- ============================================================
CREATE POLICY "rooms_read_own"
  ON rooms FOR SELECT
  USING (daycare_id = public.get_current_user_daycare_id());

CREATE POLICY "rooms_staff_crud"
  ON rooms FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

-- ============================================================
-- children: staff CRUD, parents read only their linked children
-- ============================================================
CREATE POLICY "children_staff_crud"
  ON children FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "children_parent_read_linked"
  ON children FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- child_allergy_tags: same access as children
-- ============================================================
CREATE POLICY "child_allergy_tags_staff_crud"
  ON child_allergy_tags FOR ALL
  USING (
    public.get_current_user_role() IN ('staff', 'admin')
  )
  WITH CHECK (
    public.get_current_user_role() IN ('staff', 'admin')
  );

CREATE POLICY "child_allergy_tags_parent_read_linked"
  ON child_allergy_tags FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND child_id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- parent_children: staff CRUD, parents read only their own links
-- ============================================================
CREATE POLICY "parent_children_staff_crud"
  ON parent_children FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "parent_children_parent_read_own"
  ON parent_children FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND parent_id = auth.uid()
  );

-- ============================================================
-- posts: staff CRUD, parents read posts of their children + announcements
-- ============================================================
CREATE POLICY "posts_staff_crud"
  ON posts FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "posts_parent_read_children_posts"
  ON posts FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND (
      id IN (
        SELECT post_id FROM post_children pc
        JOIN parent_children ppc ON pc.child_id = ppc.child_id
        WHERE ppc.parent_id = auth.uid()
      )
      OR (type = 'announcement' AND room_id IN (
        SELECT room_id FROM parent_children ppc2
        JOIN children c ON ppc2.child_id = c.id
        WHERE ppc2.parent_id = auth.uid() AND c.room_id IS NOT NULL
      ))
    )
  );

-- ============================================================
-- post_children: same access as posts
-- ============================================================
CREATE POLICY "post_children_staff_crud"
  ON post_children FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "post_children_parent_read_own"
  ON post_children FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND child_id IN (
      SELECT child_id FROM parent_children WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- post_photos: same access as posts
-- ============================================================
CREATE POLICY "post_photos_staff_crud"
  ON post_photos FOR ALL
  USING (public.get_current_user_role() IN ('staff', 'admin'))
  WITH CHECK (public.get_current_user_role() IN ('staff', 'admin'));

CREATE POLICY "post_photos_parent_read_own"
  ON post_photos FOR SELECT
  USING (
    public.get_current_user_role() = 'parent'
    AND post_id IN (
      SELECT post_id FROM post_children pc
      JOIN parent_children ppc ON pc.child_id = ppc.child_id
      WHERE ppc.parent_id = auth.uid()
    )
  );
