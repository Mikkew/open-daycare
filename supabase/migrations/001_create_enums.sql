-- Create ENUMs

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'active');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE relationship_type AS ENUM ('father', 'mother', 'guardian');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('meal', 'nap', 'activity', 'achievement', 'photo', 'announcement');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE child_status AS ENUM ('active', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
