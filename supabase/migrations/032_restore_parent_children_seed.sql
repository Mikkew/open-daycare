-- Restore parent_children links for seed parents to new children
-- The original children (Mateo, etc.) were deleted in migration 030
-- These parents are now linked to the current active children

-- Lucía Fernández (f0000000-0000-0000-0000-000000000010) → madre de Tomás Rodríguez
INSERT INTO parent_children (id, parent_id, child_id, relationship) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000010', 'cef8af84-cd94-48fa-8bf1-7d315e481d58', 'mother')
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Diego Fernández (f0000000-0000-0000-0000-000000000011) → padre de Tomás Rodríguez
INSERT INTO parent_children (id, parent_id, child_id, relationship) VALUES
  ('f0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000011', 'cef8af84-cd94-48fa-8bf1-7d315e481d58', 'father')
ON CONFLICT (parent_id, child_id) DO NOTHING;
