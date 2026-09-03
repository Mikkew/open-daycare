-- Seed initial data

-- Use fixed UUIDs so references work
-- Daycare
INSERT INTO daycares (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Guardería Sala Soles')
ON CONFLICT (id) DO NOTHING;

-- Rooms
INSERT INTO rooms (id, daycare_id, name) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Soles'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Lunas'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Estrellas')
ON CONFLICT (id) DO NOTHING;

-- Staff user: Caro Giménez
INSERT INTO users (id, daycare_id, role, full_name, avatar_url) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'staff', 'Caro Giménez', NULL)
ON CONFLICT (id) DO NOTHING;

-- Children (8 from mock, distributed across 3 rooms)
INSERT INTO children (id, room_id, full_name, birth_date, enrolled_at, medical_notes, photo_consent, status) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Mateo Fernández', '2022-03-12', '2025-02-01', 'Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.', true, 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Sofía Méndez', '2023-05-15', '2025-02-01', NULL, true, 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Benjamín Ruiz', '2022-08-20', '2025-02-01', NULL, true, 'active'),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Valentina Soto', '2023-11-03', '2025-02-01', NULL, true, 'active'),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Tomás Díaz', '2022-06-10', '2025-02-01', 'Alergia a la lactosa.', true, 'active'),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Emma Castro', '2023-09-25', '2025-02-01', NULL, true, 'active'),
  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'Lucas Romero', '2022-01-18', '2025-02-01', NULL, true, 'active'),
  ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Olivia Vega', '2023-04-07', '2025-02-01', NULL, true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Child allergy tags
INSERT INTO child_allergy_tags (id, child_id, tag) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'peanut'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', 'lactose')
ON CONFLICT (child_id, tag) DO NOTHING;

-- Linked parents (from mock)
INSERT INTO parent_children (id, parent_id, child_id, relationship) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000001', 'mother'),
  ('f0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001', 'father')
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO users (id, daycare_id, role, full_name) VALUES
  ('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'parent', 'Lucía Fernández'),
  ('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'parent', 'Diego Fernández')
ON CONFLICT (id) DO NOTHING;

-- Posts (3 from mock)
INSERT INTO posts (id, author_id, room_id, type, title, body, published_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'achievement', NULL, '¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.', '2026-09-02 14:20:00+00'),
  ('a1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'activity', NULL, 'Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.', '2026-09-02 09:40:00+00'),
  ('a1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', NULL, 'announcement', 'Salida al parque', 'El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.', '2026-09-02 07:50:00+00')
ON CONFLICT (id) DO NOTHING;

-- Post children (Mateo tagged in posts 1 and 2)
INSERT INTO post_children (post_id, child_id) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT (post_id, child_id) DO NOTHING;
