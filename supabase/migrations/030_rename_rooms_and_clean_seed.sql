-- Migration 030: Rename "Lunas" room to "Arcoiris" and clean all seed data

-- 1. Rename "Lunas" → "Arcoiris"
UPDATE rooms SET name = 'Arcoiris' WHERE name = 'Lunas';

-- 2. Clean seed data from dependent tables first (FK constraints)
DELETE FROM child_allergy_tags;
DELETE FROM parent_children;

-- 3. Clean seed children
DELETE FROM children;
