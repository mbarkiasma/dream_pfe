-- Run this after class_diagram_schema.sql.
-- It lets the metier schema work with Payload users instead of Supabase Auth users.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE metier.utilisateur
  DROP CONSTRAINT IF EXISTS utilisateur_id_fkey;

ALTER TABLE metier.utilisateur
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE metier.utilisateur
  ADD COLUMN IF NOT EXISTS payload_user_id integer UNIQUE;

CREATE INDEX IF NOT EXISTS idx_metier_utilisateur_payload_user_id
  ON metier.utilisateur(payload_user_id);

COMMIT;
