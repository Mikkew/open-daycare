-- Seed posts and related data (re-seed after tables were recreated)
-- Uses correct author_id that matches the staff user created by seed_test_users

-- Posts (3 from mock) — author_id matches Caro Giménez (b0000000-0000-0000-0000-000000000001)
INSERT INTO posts (id, author_id, room_id, type, title, body, published_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'achievement', NULL, '¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.', '2026-09-02 14:20:00+00'),
  ('a1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'activity', NULL, 'Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.', '2026-09-02 09:40:00+00'),
  ('a1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', NULL, 'announcement', 'Salida al parque', 'El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.', '2026-09-02 07:50:00+00')
ON CONFLICT (id) DO NOTHING;

-- Post children (Mateo tagged in posts 1 and 2)
INSERT INTO post_children (post_id, child_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT (post_id, child_id) DO NOTHING;
