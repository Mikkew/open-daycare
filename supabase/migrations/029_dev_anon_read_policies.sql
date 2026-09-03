-- Development-only policies: allow anonymous access to all tables
-- These policies are PERMISSIVE and apply to the 'anon' role
-- In production, these should be removed or restricted

-- Allow anonymous SELECT on all tables for development/demo
CREATE POLICY "anon_read_all" ON daycares FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON rooms FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON children FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON child_allergy_tags FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON parent_children FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON post_children FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_all" ON post_photos FOR SELECT TO anon USING (true);
